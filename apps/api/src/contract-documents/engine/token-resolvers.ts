/**
 * Resuelve los valores de los tokens de un documento contractual para un
 * colaborador/contrato y una fecha efectiva determinados. Un solo conjunto
 * de consultas por generación (no una por token); el resultado es un mapa
 * plano código-de-token -> valor crudo que template-engine.ts consulta de
 * forma síncrona.
 *
 * AFP, salud y cuenta bancaria se resuelven "vigente a la fecha efectiva"
 * con el mismo patrón que payroll-periods.service.ts (findFirst con
 * effectiveFrom <= fecha AND (effectiveTo IS NULL OR effectiveTo >= fecha),
 * orderBy effectiveFrom desc).
 *
 * Limitación conocida: Contract.baseSalary no está historizado (no existe
 * una tabla de sueldo por fecha), así que compensation.baseSalary siempre
 * refleja el valor actual del contrato, no el vigente en `effectiveDate` si
 * ésta es una fecha pasada. Corregirlo requeriría extender el modelo de
 * Contract, fuera del alcance de este módulo.
 */
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { formatRut } from '../../common/validators/rut.util.js';

export interface DocumentContext {
  employeeId: string;
  contractId: string;
  documentDate: Date;
  effectiveDate: Date;
  documentNumber?: string;
}

function employeeFullName(e: { firstName: string; lastName: string; secondLastName?: string | null }): string {
  return [e.firstName, e.lastName, e.secondLastName].filter(Boolean).join(' ');
}

export async function buildDocumentTokenValues(
  prisma: PrismaService,
  ctx: DocumentContext,
): Promise<Record<string, unknown>> {
  const employee = await prisma.employee.findUnique({ where: { id: ctx.employeeId } });
  if (!employee) throw new NotFoundException('Colaborador no encontrado');

  const contract = await prisma.contract.findUnique({
    where: { id: ctx.contractId },
    include: {
      position: { include: { cargo: true, costCenter: true, department: { include: { costCenter: true } } } },
      legalEntity: true,
      laborRegime: true,
      contractType: true,
    },
  });
  if (!contract) throw new NotFoundException('Contrato no encontrado');
  if (contract.employeeId !== ctx.employeeId) {
    throw new NotFoundException('El contrato no pertenece al colaborador indicado');
  }

  const { effectiveDate } = ctx;

  const afpAffiliation = await prisma.employeeAfp.findFirst({
    where: {
      employeeId: ctx.employeeId,
      effectiveFrom: { lte: effectiveDate },
      OR: [{ effectiveTo: null }, { effectiveTo: { gte: effectiveDate } }],
    },
    include: { afp: true },
    orderBy: { effectiveFrom: 'desc' },
  });

  const health = await prisma.healthAffiliation.findFirst({
    where: {
      employeeId: ctx.employeeId,
      effectiveFrom: { lte: effectiveDate },
      OR: [{ effectiveTo: null }, { effectiveTo: { gte: effectiveDate } }],
    },
    include: { healthInstitution: true },
    orderBy: { effectiveFrom: 'desc' },
  });

  const bankAccount = await prisma.employeeBankAccount.findFirst({
    where: {
      employeeId: ctx.employeeId,
      isPrimary: true,
      effectiveFrom: { lte: effectiveDate },
      OR: [{ effectiveTo: null }, { effectiveTo: { gte: effectiveDate } }],
    },
    include: { bank: true, accountType: true, paymentMethod: true },
    orderBy: { effectiveFrom: 'desc' },
  });

  const costCenter = contract.position.costCenter ?? contract.position.department?.costCenter ?? null;

  const values: Record<string, unknown> = {
    'employee.firstName': employee.firstName,
    'employee.lastName': employee.lastName,
    'employee.secondLastName': employee.secondLastName ?? undefined,
    'employee.fullName': employeeFullName(employee),
    'employee.rut': employee.rut ?? undefined,
    'employee.rutFormatted': employee.rut ? formatRut(employee.rut) : undefined,
    'employee.nationality': employee.nationality ?? undefined,
    'employee.birthDate': employee.birthDate ?? undefined,
    'employee.email': employee.email ?? undefined,
    'employee.phone': employee.phone ?? undefined,
    'employee.address': employee.address ?? undefined,
    'employee.commune': employee.commune ?? undefined,
    'employee.region': employee.region ?? undefined,

    'contract.contractNumber': contract.contractNumber,
    'contract.startDate': contract.startDate,
    'contract.endDate': contract.endDate ?? undefined,
    'contract.baseSalary': Number(contract.baseSalary),
    'contract.weeklyHours': contract.weeklyHours,
    'contract.isFixedTerm': contract.contractType.requiresEndDate,
    'contract.legalRegimeName': contract.laborRegime.name,
    'contract.contractTypeName': contract.contractType.name,

    'position.title': contract.position.title,
    'position.cargoName': contract.position.cargo?.name ?? undefined,

    'costCenter.name': costCenter?.name ?? undefined,
    'costCenter.code': costCenter?.code ?? undefined,

    'company.name': contract.legalEntity.name,
    'company.code': contract.legalEntity.code,
    'company.rut': contract.legalEntity.rut ?? undefined,
    'company.rutFormatted': contract.legalEntity.rut ? formatRut(contract.legalEntity.rut) : undefined,
    'company.legalName': contract.legalEntity.legalName ?? undefined,
    'company.address': contract.legalEntity.address ?? undefined,
    'company.city': contract.legalEntity.city ?? undefined,
    'company.legalRepresentativeName': contract.legalEntity.legalRepresentativeName ?? undefined,
    'company.legalRepresentativeRut': contract.legalEntity.legalRepresentativeRut
      ? formatRut(contract.legalEntity.legalRepresentativeRut)
      : undefined,

    // Alias documental: "sueldo vigente al effectiveDate" (ver limitación en el encabezado de este archivo).
    'compensation.baseSalary': Number(contract.baseSalary),

    'afp.name': afpAffiliation?.afp.name,
    'afp.workerRate': afpAffiliation ? Number(afpAffiliation.afp.workerRate) : undefined,

    'health.institutionName': health?.healthInstitution.name,
    'health.institutionType': health?.healthInstitution.type,
    'health.planUfValue': health?.planUfValue ? Number(health.planUfValue) : undefined,

    'bankAccount.bankName': bankAccount?.bank.name,
    'bankAccount.accountTypeName': bankAccount?.accountType.name,
    'bankAccount.accountHolderName': bankAccount?.accountHolderName,
    'bankAccount.accountNumberMasked': bankAccount ? maskAccountNumber(bankAccount.accountNumber) : undefined,

    'document.date': ctx.documentDate,
    'document.effectiveDate': ctx.effectiveDate,
    'document.number': ctx.documentNumber,
  };

  return values;
}

function maskAccountNumber(accountNumber: string): string {
  const last4 = accountNumber.slice(-4);
  return `****${last4}`;
}
