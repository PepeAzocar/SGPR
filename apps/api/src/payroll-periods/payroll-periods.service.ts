import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { PayrollCalculatorService } from '../payroll/chile/payroll-calculator.service.js';
import { CreatePayrollPeriodDto } from './dto/create-payroll-period.dto.js';
import { UpdatePayrollPeriodDto } from './dto/update-payroll-period.dto.js';
import type { PayrollConcept } from '../generated/prisma/client.js';
import type { PayrollDetailOrigin } from '../generated/prisma/enums.js';

const SYSTEM_CONCEPT_CODES = [
  'SUELDO_BASE',
  'GRATIFICACION',
  'AFP',
  'SALUD',
  'AFC',
  'IMPUESTO_UNICO',
] as const;

const resultInclude = {
  employee: true,
  details: { include: { concept: true } },
  employment: true,
};

@Injectable()
export class PayrollPeriodsService {
  constructor(
    private prisma: PrismaService,
    private calculator: PayrollCalculatorService,
  ) {}

  create(dto: CreatePayrollPeriodDto) {
    return this.prisma.payrollPeriod.create({ data: dto });
  }

  findAll() {
    return this.prisma.payrollPeriod.findMany({ orderBy: [{ year: 'desc' }, { month: 'desc' }] });
  }

  async findOne(id: string) {
    const period = await this.prisma.payrollPeriod.findUnique({
      where: { id },
      include: {
        results: {
          where: { isCurrent: true },
          include: resultInclude,
          orderBy: { employee: { lastName: 'asc' } },
        },
      },
    });
    if (!period) throw new NotFoundException('Período no encontrado');
    return period;
  }

  async update(id: string, dto: UpdatePayrollPeriodDto) {
    await this.findOne(id);
    return this.prisma.payrollPeriod.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.payrollPeriod.delete({ where: { id } });
  }

  /**
   * Calcula el período: crea un PayrollRun (REGULAR la primera vez sobre este
   * período, CORRECTION las siguientes) y, por cada colaborador, un
   * PayrollResult nuevo. Nunca sobrescribe un resultado ya calculado — si ya
   * existía uno vigente, se marca SUPERSEDED/isCurrent=false y el nuevo queda
   * enlazado vía parentResultId, con previousNetAmount/differenceAmount.
   */
  async calculate(id: string) {
    const period = await this.prisma.payrollPeriod.findUnique({ where: { id } });
    if (!period) throw new NotFoundException('Período no encontrado');

    const periodDate = new Date(Date.UTC(period.year, period.month - 1, 1));

    const indicator = await this.prisma.economicIndicator.findFirst({
      where: { period: { lte: periodDate } },
      orderBy: { period: 'desc' },
    });
    if (!indicator) {
      throw new BadRequestException(
        'No hay indicadores económicos (UF/UTM/ingreso mínimo) cargados para este período o anteriores',
      );
    }

    const latestBracketSet = await this.prisma.taxBracket.findFirst({
      where: { validFrom: { lte: periodDate } },
      orderBy: { validFrom: 'desc' },
    });
    if (!latestBracketSet) {
      throw new BadRequestException('No hay tabla de impuesto único cargada para este período');
    }
    const brackets = await this.prisma.taxBracket.findMany({
      where: { validFrom: latestBracketSet.validFrom },
      orderBy: { fromUtm: 'asc' },
    });

    const concepts = await this.ensureSystemConcepts();

    const periodStart = periodDate;
    const periodEnd = new Date(Date.UTC(period.year, period.month, 0));

    const contracts = await this.prisma.contract.findMany({
      where: {
        isActive: true,
        startDate: { lte: periodEnd },
        OR: [{ endDate: null }, { endDate: { gte: periodStart } }],
        employee: { status: 'ACTIVE' },
      },
      include: {
        employee: true,
        contractType: true,
        legalEntity: true,
        position: {
          include: {
            cargo: true,
            costCenter: true,
            department: { include: { costCenter: true } },
          },
        },
      },
    });

    const lastRun = await this.prisma.payrollRun.findFirst({
      where: { payrollPeriodId: id },
      orderBy: { runNumber: 'desc' },
    });
    const runNumber = (lastRun?.runNumber ?? 0) + 1;
    const runType = runNumber === 1 ? 'REGULAR' : 'CORRECTION';
    const run = await this.prisma.payrollRun.create({
      data: {
        payrollPeriodId: id,
        runNumber,
        runType,
        correctionNumber: runNumber > 1 ? runNumber - 1 : null,
        calculationDate: new Date(),
        status: 'RUNNING',
      },
    });

    const results: unknown[] = [];
    try {
      for (const contract of contracts) {
        const { employee } = contract;

        // Se usa la AFP y la afiliación de salud vigentes en la fecha del período
        // (no un dato fijo del empleado), para que las liquidaciones históricas se
        // recalculen siempre con la comisión, fondo y plan que correspondían en ese momento.
        const afpAffiliation = await this.prisma.employeeAfp.findFirst({
          where: {
            employeeId: employee.id,
            effectiveFrom: { lte: periodEnd },
            OR: [{ effectiveTo: null }, { effectiveTo: { gte: periodStart } }],
          },
          include: { afp: true },
          orderBy: { effectiveFrom: 'desc' },
        });
        if (!afpAffiliation) {
          throw new BadRequestException(
            `El empleado ${employee.documentNumber} no tiene afiliación AFP vigente para este período`,
          );
        }

        const health = await this.prisma.healthAffiliation.findFirst({
          where: {
            employeeId: employee.id,
            effectiveFrom: { lte: periodEnd },
            OR: [{ effectiveTo: null }, { effectiveTo: { gte: periodStart } }],
          },
          include: { healthInstitution: true },
          orderBy: { effectiveFrom: 'desc' },
        });
        if (!health) {
          throw new BadRequestException(
            `El empleado ${employee.documentNumber} no tiene afiliación de salud vigente para este período`,
          );
        }

        const afpTotalRatePct =
          Number(afpAffiliation.mandatoryContributionPct) +
          Number(afpAffiliation.afpCommissionPct ?? 0) +
          Number(afpAffiliation.additionalContributionPct ?? 0);

        const calc = this.calculator.calculate({
          baseSalary: Number(contract.baseSalary),
          otherTaxableEarnings: 0,
          nonTaxableEarnings: 0,
          contractType: contract.contractType.code,
          afpWorkerRatePct: afpTotalRatePct,
          isFonasa: health.healthInstitution.type === 'FONASA',
          isapreMonthlyPlanClp: health.planUfValue
            ? Number(health.planUfValue) * Number(indicator.ufValue)
            : null,
          indicators: {
            ufValue: Number(indicator.ufValue),
            utmValue: Number(indicator.utmValue),
            minWage: Number(indicator.minWage),
            afpHealthCapUf: Number(indicator.afpHealthCapUf),
          },
          taxBrackets: brackets.map((b) => ({
            fromUtm: Number(b.fromUtm),
            toUtm: b.toUtm === null ? null : Number(b.toUtm),
            factor: Number(b.factor),
            deductionUtm: Number(b.deductionUtm),
          })),
        });

        const isIndefinido = contract.contractType.code === 'INDEFINIDO';
        const costCenter = contract.position.costCenter ?? contract.position.department?.costCenter ?? null;

        const detailRows: Array<{
          concept: PayrollConcept;
          amount: number;
          taxable?: boolean;
          pensionable?: boolean;
          healthTaxable?: boolean;
          unemploymentTaxable?: boolean;
          incomeTaxable?: boolean;
          origin: PayrollDetailOrigin;
        }> = [
          { concept: concepts.SUELDO_BASE, amount: Number(contract.baseSalary), taxable: true, pensionable: true, healthTaxable: true, unemploymentTaxable: true, incomeTaxable: true, origin: 'CONTRACT' },
          { concept: concepts.GRATIFICACION, amount: calc.gratificacionLegal, taxable: true, pensionable: true, healthTaxable: true, unemploymentTaxable: true, incomeTaxable: true, origin: 'SYSTEM_CALCULATION' },
          { concept: concepts.AFP, amount: calc.afpDeduction, origin: 'SYSTEM_CALCULATION' },
          { concept: concepts.SALUD, amount: calc.healthDeduction, origin: 'SYSTEM_CALCULATION' },
          ...(isIndefinido ? [{ concept: concepts.AFC, amount: calc.afcDeduction, origin: 'SYSTEM_CALCULATION' as PayrollDetailOrigin }] : []),
          { concept: concepts.IMPUESTO_UNICO, amount: calc.incomeTax, origin: 'SYSTEM_CALCULATION' },
        ];

        const previous = await this.prisma.payrollResult.findFirst({
          where: { employeeId: employee.id, payrollPeriodId: id, isCurrent: true },
        });
        const resultSequence = (previous?.resultSequence ?? 0) + 1;
        const resultType = previous ? 'CORRECTION' : 'REGULAR';

        const result = await this.prisma.$transaction(async (tx) => {
          if (previous) {
            await tx.payrollResult.update({
              where: { id: previous.id },
              data: { isCurrent: false, status: 'SUPERSEDED' },
            });
          }
          return tx.payrollResult.create({
            data: {
              payrollRunId: run.id,
              payrollPeriodId: id,
              employeeId: employee.id,
              contractId: contract.id,
              resultSequence,
              resultType,
              parentResultId: previous?.id,
              calculationDate: new Date(),
              totalEarnings: calc.totalEarnings,
              taxableEarnings: calc.taxableEarnings,
              nonTaxableEarnings: 0,
              totalDeductions: calc.totalDeductions,
              totalLegalDeductions: calc.totalDeductions,
              totalOtherDeductions: 0,
              totalTaxable: calc.taxableIncomeAfterSocialSecurity,
              totalPensionable: calc.taxableBaseCapped,
              totalHealthBase: calc.taxableBaseCapped,
              netAmount: calc.netPay,
              previousNetAmount: previous?.netAmount,
              differenceAmount: previous ? calc.netPay - Number(previous.netAmount) : null,
              status: 'CALCULATED',
              isCurrent: true,
              details: {
                create: detailRows.map((row, index) => ({
                  conceptId: row.concept.id,
                  conceptCode: row.concept.code,
                  conceptName: row.concept.name,
                  conceptType: row.concept.type,
                  sequence: (index + 1) * 10,
                  amount: row.amount,
                  taxable: row.taxable ?? false,
                  pensionable: row.pensionable ?? false,
                  healthTaxable: row.healthTaxable ?? false,
                  unemploymentTaxable: row.unemploymentTaxable ?? false,
                  incomeTaxable: row.incomeTaxable ?? false,
                  origin: row.origin,
                })),
              },
              employment: {
                create: {
                  legalEntityId: contract.legalEntityId,
                  legalEntityName: contract.legalEntity.name,
                  costCenterId: costCenter?.id,
                  costCenterName: costCenter?.name,
                  departmentId: contract.position.departmentId,
                  departmentName: contract.position.department?.name,
                  positionId: contract.positionId,
                  positionTitle: contract.position.title,
                  contractTypeId: contract.contractTypeId,
                  contractTypeName: contract.contractType.name,
                  weeklyHours: contract.weeklyHours,
                  baseSalary: contract.baseSalary,
                  validFrom: periodStart,
                  validTo: periodEnd,
                },
              },
            },
            include: resultInclude,
          });
        });

        results.push(result);
      }

      await this.prisma.payrollRun.update({ where: { id: run.id }, data: { status: 'COMPLETED' } });
      await this.prisma.payrollPeriod.update({ where: { id: period.id }, data: { status: 'CALCULATED' } });
    } catch (err) {
      await this.prisma.payrollRun.update({ where: { id: run.id }, data: { status: 'FAILED' } });
      throw err;
    }

    return { runId: run.id, runNumber, runType, calculated: results.length, results };
  }

  private async ensureSystemConcepts() {
    const existing = await this.prisma.payrollConcept.findMany({
      where: { code: { in: [...SYSTEM_CONCEPT_CODES] } },
    });
    const byCode = new Map(existing.map((c) => [c.code, c]));

    const defaults: Record<
      (typeof SYSTEM_CONCEPT_CODES)[number],
      { name: string; type: 'EARNING' | 'DEDUCTION'; category: 'TAXABLE' | 'LEGAL_DEDUCTION' }
    > = {
      SUELDO_BASE: { name: 'Sueldo base', type: 'EARNING', category: 'TAXABLE' },
      GRATIFICACION: { name: 'Gratificación legal', type: 'EARNING', category: 'TAXABLE' },
      AFP: { name: 'Cotización AFP', type: 'DEDUCTION', category: 'LEGAL_DEDUCTION' },
      SALUD: { name: 'Cotización salud', type: 'DEDUCTION', category: 'LEGAL_DEDUCTION' },
      AFC: { name: 'Seguro de cesantía', type: 'DEDUCTION', category: 'LEGAL_DEDUCTION' },
      IMPUESTO_UNICO: { name: 'Impuesto único', type: 'DEDUCTION', category: 'LEGAL_DEDUCTION' },
    };

    for (const code of SYSTEM_CONCEPT_CODES) {
      if (!byCode.has(code)) {
        const created = await this.prisma.payrollConcept.create({
          data: { code, ...defaults[code], isSystem: true },
        });
        byCode.set(code, created);
      }
    }

    return Object.fromEntries(byCode) as Record<(typeof SYSTEM_CONCEPT_CODES)[number], (typeof existing)[number]>;
  }
}
