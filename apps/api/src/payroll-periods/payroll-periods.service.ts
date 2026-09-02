import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { PayrollCalculatorService } from '../payroll/chile/payroll-calculator.service.js';
import { CreatePayrollPeriodDto } from './dto/create-payroll-period.dto.js';
import { UpdatePayrollPeriodDto } from './dto/update-payroll-period.dto.js';

const SYSTEM_CONCEPT_CODES = [
  'SUELDO_BASE',
  'GRATIFICACION',
  'AFP',
  'SALUD',
  'AFC',
  'IMPUESTO_UNICO',
] as const;

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
      include: { payslips: { include: { employee: true, items: { include: { concept: true } } } } },
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
      include: { employee: true, contractType: true },
    });

    const results = [];
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

      const payslip = await this.prisma.payslip.upsert({
        where: { employeeId_periodId: { employeeId: employee.id, periodId: period.id } },
        create: {
          employeeId: employee.id,
          periodId: period.id,
          totalEarnings: calc.totalEarnings,
          totalDeductions: calc.totalDeductions,
          netPay: calc.netPay,
        },
        update: {
          totalEarnings: calc.totalEarnings,
          totalDeductions: calc.totalDeductions,
          netPay: calc.netPay,
        },
      });

      await this.prisma.payslipItem.deleteMany({ where: { payslipId: payslip.id } });
      await this.prisma.payslipItem.createMany({
        data: [
          { payslipId: payslip.id, conceptId: concepts.SUELDO_BASE.id, amount: contract.baseSalary },
          { payslipId: payslip.id, conceptId: concepts.GRATIFICACION.id, amount: calc.gratificacionLegal },
          { payslipId: payslip.id, conceptId: concepts.AFP.id, amount: calc.afpDeduction },
          { payslipId: payslip.id, conceptId: concepts.SALUD.id, amount: calc.healthDeduction },
          { payslipId: payslip.id, conceptId: concepts.AFC.id, amount: calc.afcDeduction },
          { payslipId: payslip.id, conceptId: concepts.IMPUESTO_UNICO.id, amount: calc.incomeTax },
        ],
      });

      results.push(payslip);
    }

    await this.prisma.payrollPeriod.update({ where: { id: period.id }, data: { status: 'CALCULATED' } });

    return { calculated: results.length, payslips: results };
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
