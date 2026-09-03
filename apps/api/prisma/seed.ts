/**
 * Seed de datos base para desarrollo.
 *
 * IMPORTANTE: los valores marcados como "EJEMPLO" (comisiones AFP, UF, UTM,
 * ingreso mínimo, tope imponible y tabla de impuesto único) son valores de
 * referencia para poder calcular liquidaciones de prueba. Antes de usar el
 * sistema en producción, un administrador debe actualizarlos con las cifras
 * vigentes publicadas por la Superintendencia de Pensiones / Previred y el SII
 * (esto se hace desde los catálogos: AFP, Instituciones de salud, Indicadores
 * económicos y Tramos de impuesto único).
 */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import { PrismaClient } from '../src/generated/prisma/client.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // --- Usuario administrador inicial ---
  const adminEmail = 'admin@gpr.local';
  const adminPasswordHash = await bcrypt.hash('Admin123!', 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, passwordHash: adminPasswordHash, role: 'ADMIN' },
  });
  console.log(`Usuario admin: ${adminEmail} / Admin123! (cambiar en producción)`);

  const effectiveFrom = new Date(Date.UTC(2026, 0, 1));

  // --- AFPs (comisión trabajador EJEMPLO, incluye 10% obligatorio + comisión) ---
  const afps = [
    { name: 'Capital', workerRate: 11.44 },
    { name: 'Cuprum', workerRate: 11.44 },
    { name: 'Habitat', workerRate: 11.27 },
    { name: 'Modelo', workerRate: 10.58 },
    { name: 'PlanVital', workerRate: 11.16 },
    { name: 'ProVida', workerRate: 11.45 },
    { name: 'Uno', workerRate: 10.49 },
  ];
  for (const afp of afps) {
    await prisma.afpEntity.upsert({
      where: { name: afp.name },
      update: {},
      create: { ...afp, effectiveFrom },
    });
  }

  // --- Instituciones de salud ---
  await prisma.healthInstitution.upsert({
    where: { name: 'Fonasa' },
    update: {},
    create: { name: 'Fonasa', type: 'FONASA', effectiveFrom },
  });
  const isapres = ['Banmédica', 'Colmena', 'Cruz Blanca', 'Consalud', 'Nueva Masvida'];
  for (const name of isapres) {
    await prisma.healthInstitution.upsert({
      where: { name },
      update: {},
      create: { name, type: 'ISAPRE', effectiveFrom },
    });
  }

  // --- Mutualidades (Ley 16.744) ---
  const mutualities = [
    { code: 'MUT-ACHS', rut: '70.144.100-9', legalName: 'Asociación Chilena de Seguridad', tradeName: 'ACHS' },
    { code: 'MUT-IST', rut: '70.365.300-8', legalName: 'Instituto de Seguridad del Trabajo', tradeName: 'IST' },
    {
      code: 'MUT-MUTSEG',
      rut: '70.116.500-8',
      legalName: 'Mutual de Seguridad de la Cámara Chilena de la Construcción',
      tradeName: 'Mutual de Seguridad CChC',
    },
  ];
  for (const mutuality of mutualities) {
    await prisma.mutuality.upsert({
      where: { code: mutuality.code },
      update: {},
      create: { ...mutuality, effectiveFrom },
    });
  }

  // --- Cajas de Compensación de Asignación Familiar (CCAF) ---
  const ccafs = [
    { code: 'CCAF-LOSANDES', rut: '70.999.500-1', legalName: 'Caja de Compensación Los Andes', tradeName: 'Los Andes' },
    { code: 'CCAF-ARAUCANA', rut: '70.999.600-2', legalName: 'Caja de Compensación La Araucana', tradeName: 'La Araucana' },
    { code: 'CCAF-LOSHEROES', rut: '70.999.700-3', legalName: 'Caja de Compensación Los Héroes', tradeName: 'Los Héroes' },
    { code: 'CCAF-18SEP', rut: '70.999.800-4', legalName: 'Caja de Compensación 18 de Septiembre', tradeName: '18 de Septiembre' },
  ];
  for (const ccaf of ccafs) {
    await prisma.ccaf.upsert({
      where: { code: ccaf.code },
      update: {},
      create: { ...ccaf, effectiveFrom },
    });
  }

  // --- Indicadores económicos EJEMPLO para el período actual ---
  await prisma.economicIndicator.upsert({
    where: { period: new Date(Date.UTC(2026, 8, 1)) },
    update: {},
    create: {
      period: new Date(Date.UTC(2026, 8, 1)),
      ufValue: 39000,
      utmValue: 68000,
      minWage: 500000,
      afpHealthCapUf: 87.8,
    },
  });

  // --- Tabla de impuesto único EJEMPLO (estructura de 8 tramos vigente hace años; verificar factores/UTM actuales en sii.cl) ---
  const validFrom = new Date(Date.UTC(2026, 8, 1));
  const brackets: Array<{ fromUtm: number; toUtm: number | null; factor: number; deductionUtm: number }> = [
    { fromUtm: 0, toUtm: 13.5, factor: 0, deductionUtm: 0 },
    { fromUtm: 13.5, toUtm: 30, factor: 0.04, deductionUtm: 0.54 },
    { fromUtm: 30, toUtm: 50, factor: 0.08, deductionUtm: 1.74 },
    { fromUtm: 50, toUtm: 70, factor: 0.135, deductionUtm: 4.49 },
    { fromUtm: 70, toUtm: 90, factor: 0.23, deductionUtm: 11.14 },
    { fromUtm: 90, toUtm: 120, factor: 0.304, deductionUtm: 17.8 },
    { fromUtm: 120, toUtm: 310, factor: 0.35, deductionUtm: 23.32 },
    { fromUtm: 310, toUtm: null, factor: 0.4, deductionUtm: 38.82 },
  ];
  const existingBrackets = await prisma.taxBracket.findFirst({ where: { validFrom } });
  if (!existingBrackets) {
    await prisma.taxBracket.createMany({
      data: brackets.map((b) => ({ ...b, validFrom })),
    });
  }

  // --- Conceptos de remuneración del sistema ---
  const concepts = [
    { code: 'SUELDO_BASE', name: 'Sueldo base', type: 'EARNING', category: 'TAXABLE', isSystem: true },
    { code: 'GRATIFICACION', name: 'Gratificación legal', type: 'EARNING', category: 'TAXABLE', isSystem: true },
    { code: 'AFP', name: 'Cotización AFP', type: 'DEDUCTION', category: 'LEGAL_DEDUCTION', isSystem: true },
    { code: 'SALUD', name: 'Cotización salud', type: 'DEDUCTION', category: 'LEGAL_DEDUCTION', isSystem: true },
    { code: 'AFC', name: 'Seguro de cesantía', type: 'DEDUCTION', category: 'LEGAL_DEDUCTION', isSystem: true },
    { code: 'IMPUESTO_UNICO', name: 'Impuesto único', type: 'DEDUCTION', category: 'LEGAL_DEDUCTION', isSystem: true },
    { code: 'COLACION', name: 'Colación', type: 'EARNING', category: 'NON_TAXABLE', isSystem: false },
    { code: 'MOVILIZACION', name: 'Movilización', type: 'EARNING', category: 'NON_TAXABLE', isSystem: false },
  ] as const;
  for (const concept of concepts) {
    await prisma.payrollConcept.upsert({
      where: { code: concept.code },
      update: {},
      create: concept,
    });
  }

  // --- Estructura organizacional de ejemplo ---
  // LegalEntity -> BusinessUnit -> Division -> Department -> Position,
  // con CostCenter como maestro independiente referenciado desde Department y Position.
  const legalEntityIdentity = {
    rut: '76.123.456-7',
    legalName: 'Imaginadem SpA',
    address: 'Av. Providencia 1234, Oficina 501',
    city: 'Santiago',
    legalRepresentativeName: 'María José Contreras Silva',
    legalRepresentativeRut: '11.222.333-4',
  };
  const legalEntity = await prisma.legalEntity.upsert({
    where: { id: 'seed-legal-entity' },
    update: legalEntityIdentity,
    create: {
      id: 'seed-legal-entity',
      code: 'LE-001',
      name: 'Imaginadem SpA',
      effectiveFrom,
      status: 'ACTIVE',
      ...legalEntityIdentity,
    },
  });

  const businessUnit = await prisma.businessUnit.upsert({
    where: { id: 'seed-business-unit' },
    update: {},
    create: {
      id: 'seed-business-unit',
      code: 'BU-001',
      name: 'Operaciones',
      legalEntityId: legalEntity.id,
      effectiveFrom,
      status: 'ACTIVE',
    },
  });

  const division = await prisma.division.upsert({
    where: { id: 'seed-division' },
    update: {},
    create: {
      id: 'seed-division',
      code: 'DIV-001',
      name: 'Administración y Finanzas',
      businessUnitId: businessUnit.id,
      effectiveFrom,
      status: 'ACTIVE',
    },
  });

  const costCenter = await prisma.costCenter.upsert({
    where: { id: 'seed-cost-center' },
    update: {},
    create: {
      id: 'seed-cost-center',
      code: 'CC-1000',
      name: 'Administración Central',
      legalEntityId: legalEntity.id,
      effectiveFrom,
      status: 'ACTIVE',
    },
  });

  const cargo = await prisma.cargo.upsert({
    where: { id: 'seed-cargo-analista' },
    update: {},
    create: {
      id: 'seed-cargo-analista',
      code: 'CARGO-ANALISTA-REM',
      name: 'Analista de Remuneraciones',
      effectiveFrom,
      status: 'ACTIVE',
    },
  });

  const dept = await prisma.department.upsert({
    where: { id: 'seed-dept-admin' },
    update: {
      divisionId: division.id,
      costCenterId: costCenter.id,
      code: 'DEPT-001',
      effectiveFrom,
      status: 'ACTIVE',
    },
    create: {
      id: 'seed-dept-admin',
      code: 'DEPT-001',
      name: 'Administración y Finanzas',
      divisionId: division.id,
      costCenterId: costCenter.id,
      effectiveFrom,
      status: 'ACTIVE',
    },
  });
  await prisma.position.upsert({
    where: { id: 'seed-position-analista' },
    update: {
      cargoId: cargo.id,
      costCenterId: costCenter.id,
      code: 'POS-001',
      effectiveFrom,
      status: 'ACTIVE',
    },
    create: {
      id: 'seed-position-analista',
      code: 'POS-001',
      title: 'Analista de Remuneraciones',
      departmentId: dept.id,
      cargoId: cargo.id,
      costCenterId: costCenter.id,
      effectiveFrom,
      status: 'ACTIVE',
    },
  });

  // --- Régimen jurídico de la relación laboral ---
  // Catálogo parametrizable por vigencia normativa. Este despliegue opera bajo
  // Código del Trabajo (sector privado); el resto queda disponible para cuando
  // se necesite activar regímenes estatutarios (educación, salud APS, etc.).
  const laborRegimes = [
    { code: 'CODIGO_TRABAJO', name: 'Código del Trabajo', mainNorm: 'DFL N°1 - Código del Trabajo' },
    { code: 'LEY_19070', name: 'Estatuto Docente', mainNorm: 'Ley N°19.070' },
    { code: 'LEY_19464', name: 'Estatuto Asistentes de la Educación', mainNorm: 'Ley N°19.464' },
    { code: 'LEY_19378', name: 'Estatuto de Atención Primaria de Salud Municipal', mainNorm: 'Ley N°19.378' },
    { code: 'LEY_21109', name: 'Estatuto Ley N°21.109', mainNorm: 'Ley N°21.109' },
    { code: 'ESTATUTO_ADMINISTRATIVO', name: 'Estatuto Administrativo', mainNorm: 'Ley N°18.834' },
    { code: 'ESTATUTO_MUNICIPAL', name: 'Estatuto Administrativo para Funcionarios Municipales', mainNorm: 'Ley N°18.883' },
    { code: 'OTRO', name: 'Otro régimen jurídico', mainNorm: null },
  ];
  for (const regime of laborRegimes) {
    await prisma.laborRegime.upsert({ where: { code: regime.code }, update: {}, create: regime });
  }

  const codigoTrabajo = await prisma.laborRegime.findUniqueOrThrow({ where: { code: 'CODIGO_TRABAJO' } });

  // --- Tipos de contrato bajo Código del Trabajo ---
  const contractTypes = [
    {
      code: 'INDEFINIDO',
      name: 'Indefinido',
      requiresEndDate: false,
      allowsExtension: false,
      allowsIndefiniteConversion: false,
      payrollRelevant: true,
    },
    {
      code: 'PLAZO_FIJO',
      name: 'Plazo fijo',
      requiresEndDate: true,
      allowsExtension: true,
      allowsIndefiniteConversion: true,
      payrollRelevant: true,
    },
    {
      code: 'POR_OBRA_O_FAENA',
      name: 'Por obra o faena',
      requiresEndDate: false,
      allowsExtension: false,
      allowsIndefiniteConversion: false,
      payrollRelevant: true,
    },
    {
      code: 'HONORARIOS',
      name: 'Honorarios',
      requiresEndDate: true,
      allowsExtension: true,
      allowsIndefiniteConversion: false,
      payrollRelevant: false, // se paga por boleta de honorarios, fuera del motor de liquidaciones
    },
  ];
  for (const ct of contractTypes) {
    await prisma.contractType.upsert({
      where: { laborRegimeId_code: { laborRegimeId: codigoTrabajo.id, code: ct.code } },
      update: {},
      create: { ...ct, laborRegimeId: codigoTrabajo.id },
    });
  }

  // --- Variables documentales del motor de reglas de remuneraciones ---
  const payrollVariables: Array<{ code: string; name: string; source: 'EMPLOYEE' | 'CONTRACT' | 'INDICATOR' | 'PARAMETER' | 'TABLE' | 'SYSTEM'; description?: string }> = [
    { code: 'SUELDO_BASE', name: 'Sueldo base', source: 'CONTRACT', description: 'Contract.baseSalary' },
    { code: 'HORAS_SEMANALES', name: 'Horas semanales', source: 'CONTRACT', description: 'Contract.weeklyHours' },
    { code: 'DIAS_TRABAJADOS', name: 'Días trabajados en el período', source: 'SYSTEM' },
    { code: 'HORAS_EXTRAS', name: 'Horas extraordinarias', source: 'SYSTEM' },
    { code: 'ANTIGUEDAD', name: 'Antigüedad (años)', source: 'SYSTEM' },
    { code: 'CARGAS_FAMILIARES', name: 'Cargas familiares', source: 'EMPLOYEE' },
    { code: 'AFP_TASA', name: 'Tasa de cotización AFP vigente', source: 'EMPLOYEE', description: 'EmployeeAfp vigente' },
    { code: 'SALUD_TASA', name: 'Tasa de cotización salud vigente', source: 'EMPLOYEE' },
    { code: 'UF', name: 'Valor UF del período', source: 'INDICATOR' },
    { code: 'UTM', name: 'Valor UTM del período', source: 'INDICATOR' },
    { code: 'IMM', name: 'Ingreso mínimo mensual', source: 'INDICATOR' },
    { code: 'TOPE_AFP', name: 'Tope imponible AFP/salud (UF)', source: 'INDICATOR' },
    { code: 'BASE_IMPONIBLE', name: 'Base imponible calculada', source: 'SYSTEM' },
    { code: 'BASE_TRIBUTABLE', name: 'Base tributable calculada', source: 'SYSTEM' },
  ];
  for (const v of payrollVariables) {
    await prisma.payrollVariable.upsert({ where: { code: v.code }, update: {}, create: v });
  }

  // --- Bancos, tipo de cuenta y forma de pago (datos bancarios del funcionario) ---
  const banks = [
    { code: 'BCHILE', name: 'Banco de Chile', regulatorCode: '001' },
    { code: 'BESTADO', name: 'Banco Estado', regulatorCode: '012' },
    { code: 'SANTANDER', name: 'Banco Santander', regulatorCode: '037' },
    { code: 'BCI', name: 'Banco de Crédito e Inversiones', regulatorCode: '016' },
    { code: 'ITAU', name: 'Banco Itaú', regulatorCode: '039' },
    { code: 'BICE', name: 'Banco Bice', regulatorCode: '028' },
    { code: 'SECURITY', name: 'Banco Security', regulatorCode: '049' },
    { code: 'FALABELLA', name: 'Banco Falabella', regulatorCode: '051' },
    { code: 'RIPLEY', name: 'Banco Ripley', regulatorCode: '053' },
    { code: 'SCOTIABANK', name: 'Scotiabank Chile', regulatorCode: '014' },
    { code: 'CONSORCIO', name: 'Banco Consorcio', regulatorCode: '055' },
    { code: 'HSBC', name: 'HSBC Bank Chile', regulatorCode: '031' },
    { code: 'INTL', name: 'Banco Internacional', regulatorCode: '009' },
  ];
  for (const bank of banks) {
    await prisma.bank.upsert({ where: { code: bank.code }, update: {}, create: bank });
  }

  const bankAccountTypes = [
    { code: 'CUENTA_CORRIENTE', name: 'Cuenta corriente' },
    { code: 'CUENTA_VISTA', name: 'Cuenta vista' },
    { code: 'CUENTA_RUT', name: 'CuentaRUT' },
    { code: 'CUENTA_AHORRO', name: 'Cuenta de ahorro' },
    { code: 'CHEQUERA_ELECTRONICA', name: 'Chequera electrónica' },
    { code: 'OTRA', name: 'Otra' },
  ];
  for (const t of bankAccountTypes) {
    await prisma.bankAccountType.upsert({ where: { code: t.code }, update: {}, create: t });
  }

  const paymentMethods = [
    { code: 'BANK_TRANSFER', name: 'Transferencia bancaria' },
    { code: 'CASH', name: 'Efectivo' },
    { code: 'CHECK', name: 'Cheque' },
    { code: 'PAYROLL_CARD', name: 'Tarjeta de pago de remuneraciones' },
    { code: 'OTHER', name: 'Otra' },
  ];
  for (const m of paymentMethods) {
    await prisma.paymentMethod.upsert({ where: { code: m.code }, update: {}, create: m });
  }

  // --- Tipos de evento (movimientos del funcionario) y sus motivos ---
  const GENERIC_REASONS = ['Solicitud del área', 'Corrección administrativa', 'Resolución', 'Otro'];
  const eventTypes: Array<{ code: string; name: string; payrollRelevant: boolean; reasons: string[] }> = [
    { code: 'HIRE', name: 'Contratación', payrollRelevant: true, reasons: ['Ingreso', 'Reemplazo', 'Refuerzo de dotación', 'Otro'] },
    { code: 'REHIRE', name: 'Recontratación', payrollRelevant: true, reasons: ['Reingreso', 'Otro'] },
    {
      code: 'CONTRACT_CHANGE',
      name: 'Modificación contractual',
      payrollRelevant: true,
      reasons: ['Cambio de cláusulas', 'Corrección administrativa', 'Resolución', 'Otro'],
    },
    {
      code: 'CONTRACT_RENEWAL',
      name: 'Renovación',
      payrollRelevant: true,
      reasons: ['Renovación plazo fijo', 'Conversión a indefinido', 'Otro'],
    },
    {
      code: 'COST_CENTER_CHANGE',
      name: 'Cambio centro de costo',
      payrollRelevant: false,
      reasons: [
        'Reestructuración',
        'Cambio de unidad',
        'Traslado',
        'Cambio de dependencia',
        'Redistribución presupuestaria',
        'Corrección administrativa',
        'Otro',
      ],
    },
    { code: 'DEPARTMENT_CHANGE', name: 'Cambio departamento', payrollRelevant: false, reasons: ['Reestructuración', 'Traslado', ...GENERIC_REASONS] },
    { code: 'POSITION_CHANGE', name: 'Cambio posición', payrollRelevant: false, reasons: ['Reestructuración', 'Reasignación de funciones', ...GENERIC_REASONS] },
    { code: 'JOB_CHANGE', name: 'Cambio cargo', payrollRelevant: false, reasons: ['Cambio de función', 'Reclasificación', ...GENERIC_REASONS] },
    { code: 'PROMOTION', name: 'Promoción', payrollRelevant: true, reasons: ['Mérito', 'Concurso interno', 'Ascenso en carrera funcionaria', 'Otro'] },
    { code: 'TRANSFER', name: 'Traslado', payrollRelevant: false, reasons: ['Traslado a otro establecimiento', 'Traslado a otra unidad', ...GENERIC_REASONS] },
    {
      code: 'PAY_CHANGE',
      name: 'Cambio remuneración',
      payrollRelevant: true,
      reasons: [
        'Reajuste general',
        'Reajuste individual',
        'Promoción',
        'Cambio de función',
        'Incremento por antigüedad',
        'Asignación legal',
        'Asignación institucional',
        'Corrección administrativa',
        'Resolución',
        'Cambio contractual',
        'Otro',
      ],
    },
    { code: 'ALLOWANCE_CHANGE', name: 'Cambio asignación', payrollRelevant: true, reasons: ['Nueva asignación', 'Término de asignación', 'Reajuste de asignación', 'Otro'] },
    {
      code: 'WORK_SCHEDULE_CHANGE',
      name: 'Cambio jornada',
      payrollRelevant: true,
      reasons: ['Cambio de distribución horaria', 'Cambio de sistema de turno', 'Modalidad de trabajo', 'Otro'],
    },
    { code: 'HOURS_CHANGE', name: 'Cambio horas', payrollRelevant: true, reasons: ['Aumento de horas', 'Reducción de horas', 'Anexo de contrato', 'Otro'] },
    { code: 'LEAVE', name: 'Inicio ausencia', payrollRelevant: false, reasons: ['Vacaciones', 'Licencia médica', 'Permiso sin goce de sueldo', 'Otro'] },
    { code: 'RETURN_FROM_LEAVE', name: 'Retorno', payrollRelevant: false, reasons: ['Término de vacaciones', 'Término de licencia médica', 'Término de permiso', 'Otro'] },
    {
      code: 'LABOR_REGIME_CHANGE',
      name: 'Cambio régimen',
      payrollRelevant: true,
      reasons: ['Traspaso a nuevo régimen estatutario', 'Corrección administrativa', 'Resolución', 'Otro'],
    },
    { code: 'TERMINATION', name: 'Término relación laboral', payrollRelevant: true, reasons: ['Renuncia voluntaria', 'Necesidades de la empresa', 'Mutuo acuerdo', 'Vencimiento de plazo', 'Conclusión de obra o faena', 'Otro'] },
    { code: 'DATA_CHANGE', name: 'Cambio administrativo', payrollRelevant: false, reasons: ['Actualización de datos personales', 'Corrección administrativa', 'Otro'] },
    {
      code: 'BANK_ACCOUNT_CHANGE',
      name: 'Cambio de cuenta bancaria',
      payrollRelevant: true,
      reasons: ['Cambio solicitado por funcionario', 'Cambio de banco', 'Error bancario', 'Corrección administrativa', 'Otro'],
    },
  ];
  for (const et of eventTypes) {
    const eventType = await prisma.eventType.upsert({
      where: { code: et.code },
      update: {},
      create: { code: et.code, name: et.name, payrollRelevant: et.payrollRelevant },
    });
    for (const reasonName of et.reasons) {
      const reasonCode = reasonName
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      await prisma.eventReason.upsert({
        where: { eventTypeId_code: { eventTypeId: eventType.id, code: reasonCode } },
        update: {},
        create: { code: reasonCode, name: reasonName, eventTypeId: eventType.id },
      });
    }
  }

  // --- Catálogos geográficos: países, regiones y comunas de Chile ---
  const otherCountries = [
    { code: 'AR', name: 'Argentina' },
    { code: 'PE', name: 'Perú' },
    { code: 'BO', name: 'Bolivia' },
    { code: 'CO', name: 'Colombia' },
    { code: 'VE', name: 'Venezuela' },
    { code: 'EC', name: 'Ecuador' },
    { code: 'BR', name: 'Brasil' },
    { code: 'PY', name: 'Paraguay' },
    { code: 'UY', name: 'Uruguay' },
    { code: 'MX', name: 'México' },
    { code: 'ES', name: 'España' },
    { code: 'US', name: 'Estados Unidos' },
    { code: 'CU', name: 'Cuba' },
    { code: 'DO', name: 'República Dominicana' },
    { code: 'HT', name: 'Haití' },
    { code: 'CN', name: 'China' },
    { code: 'IT', name: 'Italia' },
    { code: 'DE', name: 'Alemania' },
    { code: 'FR', name: 'Francia' },
  ];
  for (const country of otherCountries) {
    await prisma.country.upsert({ where: { code: country.code }, update: {}, create: country });
  }

  const chile = await prisma.country.upsert({
    where: { code: 'CL' },
    update: {},
    create: { code: 'CL', name: 'Chile' },
  });

  const chileRegions: Array<{ code: string; name: string; communes: string[] }> = [
    {
      code: 'XV',
      name: 'Arica y Parinacota',
      communes: ['Arica', 'Camarones', 'Putre', 'General Lagos'],
    },
    {
      code: 'I',
      name: 'Tarapacá',
      communes: ['Iquique', 'Alto Hospicio', 'Pozo Almonte', 'Camiña', 'Colchane', 'Huara', 'Pica'],
    },
    {
      code: 'II',
      name: 'Antofagasta',
      communes: [
        'Antofagasta',
        'Mejillones',
        'Sierra Gorda',
        'Taltal',
        'Calama',
        'Ollagüe',
        'San Pedro de Atacama',
        'Tocopilla',
        'María Elena',
      ],
    },
    {
      code: 'III',
      name: 'Atacama',
      communes: [
        'Copiapó',
        'Caldera',
        'Tierra Amarilla',
        'Chañaral',
        'Diego de Almagro',
        'Vallenar',
        'Alto del Carmen',
        'Freirina',
        'Huasco',
      ],
    },
    {
      code: 'IV',
      name: 'Coquimbo',
      communes: [
        'La Serena',
        'Coquimbo',
        'Andacollo',
        'La Higuera',
        'Paihuano',
        'Vicuña',
        'Illapel',
        'Canela',
        'Los Vilos',
        'Salamanca',
        'Ovalle',
        'Combarbalá',
        'Monte Patria',
        'Punitaqui',
        'Río Hurtado',
      ],
    },
    {
      code: 'V',
      name: 'Valparaíso',
      communes: [
        'Valparaíso',
        'Viña del Mar',
        'Concón',
        'Quintero',
        'Puchuncaví',
        'Casablanca',
        'Juan Fernández',
        'San Antonio',
        'Cartagena',
        'El Tabo',
        'El Quisco',
        'Algarrobo',
        'Santo Domingo',
        'Quillota',
        'La Calera',
        'Hijuelas',
        'La Cruz',
        'Nogales',
        'San Felipe',
        'Putaendo',
        'Santa María',
        'Catemu',
        'Panquehue',
        'Llaillay',
        'Los Andes',
        'San Esteban',
        'Calle Larga',
        'Rinconada',
        'Isla de Pascua',
        'Limache',
        'Olmué',
        'Quilpué',
        'Villa Alemana',
      ],
    },
    {
      code: 'RM',
      name: 'Metropolitana de Santiago',
      communes: [
        'Santiago',
        'Providencia',
        'Las Condes',
        'Vitacura',
        'Ñuñoa',
        'La Reina',
        'Macul',
        'Peñalolén',
        'La Florida',
        'Puente Alto',
        'San Bernardo',
        'Maipú',
        'Pudahuel',
        'Cerrillos',
        'Estación Central',
        'Quinta Normal',
        'Independencia',
        'Recoleta',
        'Conchalí',
        'Huechuraba',
        'Renca',
        'Quilicura',
        'Colina',
        'Lampa',
        'Til Til',
        'Melipilla',
        'Talagante',
        'Peñaflor',
        'El Monte',
        'Isla de Maipo',
        'Padre Hurtado',
        'Buin',
        'Paine',
        'Calera de Tango',
        'San José de Maipo',
        'Pirque',
        'La Pintana',
        'San Ramón',
        'La Cisterna',
        'El Bosque',
        'La Granja',
        'San Miguel',
        'San Joaquín',
        'Pedro Aguirre Cerda',
        'Lo Espejo',
        'Cerro Navia',
        'Lo Prado',
        'Curacaví',
        'María Pinto',
        'Alhué',
      ],
    },
    {
      code: 'VI',
      name: "Libertador General Bernardo O'Higgins",
      communes: [
        'Rancagua',
        'Machalí',
        'Graneros',
        'Mostazal',
        'Codegua',
        'Doñihue',
        'Coinco',
        'Coltauco',
        'Requínoa',
        'Olivar',
        'Rengo',
        'Malloa',
        'Quinta de Tilcoco',
        'San Vicente de Tagua Tagua',
        'Pichidegua',
        'Peumo',
        'Las Cabras',
        'San Fernando',
        'Chimbarongo',
        'Placilla',
        'Nancagua',
        'Santa Cruz',
        'Palmilla',
        'Peralillo',
        'Chépica',
        'Pumanque',
        'Lolol',
        'Pichilemu',
        'Marchihue',
        'Navidad',
        'Litueche',
        'La Estrella',
        'Paredones',
      ],
    },
    {
      code: 'VII',
      name: 'Maule',
      communes: [
        'Talca',
        'San Clemente',
        'Maule',
        'Pelarco',
        'Pencahue',
        'Río Claro',
        'San Rafael',
        'Curepto',
        'Constitución',
        'Empedrado',
        'Curicó',
        'Molina',
        'Sagrada Familia',
        'Teno',
        'Romeral',
        'Rauco',
        'Hualañé',
        'Licantén',
        'Vichuquén',
        'Linares',
        'Longaví',
        'Parral',
        'Retiro',
        'Villa Alegre',
        'Yerbas Buenas',
        'San Javier',
        'Colbún',
        'Cauquenes',
        'Chanco',
        'Pelluhue',
      ],
    },
    {
      code: 'XVI',
      name: 'Ñuble',
      communes: [
        'Chillán',
        'Chillán Viejo',
        'Bulnes',
        'Quillón',
        'Ránquil',
        'San Ignacio',
        'El Carmen',
        'Pemuco',
        'Yungay',
        'San Carlos',
        'Coihueco',
        'Ñiquén',
        'San Fabián',
        'San Nicolás',
        'Ninhue',
        'Quirihue',
        'Cobquecura',
        'Coelemu',
        'Portezuelo',
        'Treguaco',
      ],
    },
    {
      code: 'VIII',
      name: 'Biobío',
      communes: [
        'Concepción',
        'Talcahuano',
        'Hualpén',
        'Chiguayante',
        'San Pedro de la Paz',
        'Coronel',
        'Lota',
        'Penco',
        'Tomé',
        'Hualqui',
        'Santa Juana',
        'Florida',
        'Los Ángeles',
        'Cabrero',
        'Yumbel',
        'Laja',
        'San Rosendo',
        'Nacimiento',
        'Negrete',
        'Mulchén',
        'Quilaco',
        'Quilleco',
        'Santa Bárbara',
        'Tucapel',
        'Antuco',
        'Alto Biobío',
        'Arauco',
        'Curanilahue',
        'Lebu',
        'Los Álamos',
        'Cañete',
        'Contulmo',
        'Tirúa',
      ],
    },
    {
      code: 'IX',
      name: 'La Araucanía',
      communes: [
        'Temuco',
        'Padre Las Casas',
        'Vilcún',
        'Cunco',
        'Melipeuco',
        'Curarrehue',
        'Pucón',
        'Villarrica',
        'Freire',
        'Pitrufquén',
        'Gorbea',
        'Loncoche',
        'Toltén',
        'Teodoro Schmidt',
        'Saavedra',
        'Carahue',
        'Nueva Imperial',
        'Cholchol',
        'Angol',
        'Renaico',
        'Collipulli',
        'Ercilla',
        'Victoria',
        'Traiguén',
        'Lumaco',
        'Purén',
        'Los Sauces',
        'Curacautín',
        'Lonquimay',
        'Perquenco',
      ],
    },
    {
      code: 'XIV',
      name: 'Los Ríos',
      communes: [
        'Valdivia',
        'Corral',
        'Lanco',
        'Los Lagos',
        'Máfil',
        'Mariquina',
        'Paillaco',
        'Panguipulli',
        'La Unión',
        'Futrono',
        'Lago Ranco',
        'Río Bueno',
      ],
    },
    {
      code: 'X',
      name: 'Los Lagos',
      communes: [
        'Puerto Montt',
        'Puerto Varas',
        'Cochamó',
        'Calbuco',
        'Maullín',
        'Los Muermos',
        'Fresia',
        'Frutillar',
        'Llanquihue',
        'Puerto Octay',
        'Castro',
        'Ancud',
        'Quemchi',
        'Dalcahue',
        'Curaco de Vélez',
        'Quinchao',
        'Puqueldón',
        'Chonchi',
        'Queilén',
        'Quellón',
        'Osorno',
        'San Juan de la Costa',
        'San Pablo',
        'Purranque',
        'Río Negro',
        'Puyehue',
        'Chaitén',
        'Futaleufú',
        'Hualaihué',
        'Palena',
      ],
    },
    {
      code: 'XI',
      name: 'Aysén del General Carlos Ibáñez del Campo',
      communes: [
        'Coyhaique',
        'Lago Verde',
        'Aysén',
        'Cisnes',
        'Guaitecas',
        'Cochrane',
        "O'Higgins",
        'Tortel',
        'Chile Chico',
        'Río Ibáñez',
      ],
    },
    {
      code: 'XII',
      name: 'Magallanes y de la Antártica Chilena',
      communes: [
        'Punta Arenas',
        'Laguna Blanca',
        'Río Verde',
        'San Gregorio',
        'Cabo de Hornos',
        'Antártica',
        'Porvenir',
        'Primavera',
        'Timaukel',
        'Natales',
        'Torres del Paine',
      ],
    },
  ];

  for (const regionData of chileRegions) {
    const region = await prisma.region.upsert({
      where: { countryId_name: { countryId: chile.id, name: regionData.name } },
      update: {},
      create: { code: regionData.code, name: regionData.name, countryId: chile.id },
    });
    for (const communeName of regionData.communes) {
      await prisma.commune.upsert({
        where: { regionId_name: { regionId: region.id, name: communeName } },
        update: {},
        create: { name: communeName, regionId: region.id },
      });
    }
  }

  // --- Nacionalidades (gentilicios) ---
  const nationalities = [
    'Chilena',
    'Argentina',
    'Peruana',
    'Boliviana',
    'Colombiana',
    'Venezolana',
    'Ecuatoriana',
    'Brasileña',
    'Paraguaya',
    'Uruguaya',
    'Mexicana',
    'Española',
    'Estadounidense',
    'Cubana',
    'Dominicana',
    'Haitiana',
    'China',
    'Italiana',
    'Alemana',
    'Francesa',
    'Otra',
  ];
  for (const name of nationalities) {
    await prisma.nationality.upsert({ where: { name }, update: {}, create: { name } });
  }

  // --- Motor de Documentos Contractuales: catálogo de tokens ---
  const documentTokens: Array<{
    code: string;
    namespace: string;
    name: string;
    dataType: 'STRING' | 'DATE' | 'DECIMAL' | 'BOOLEAN';
    description?: string;
    sourceEntity?: string;
    required?: boolean;
    sensitive?: boolean;
  }> = [
    { code: 'employee.firstName', namespace: 'employee', name: 'Nombres', dataType: 'STRING', sourceEntity: 'PERSON' },
    { code: 'employee.lastName', namespace: 'employee', name: 'Apellido paterno', dataType: 'STRING', sourceEntity: 'PERSON' },
    { code: 'employee.secondLastName', namespace: 'employee', name: 'Apellido materno', dataType: 'STRING', sourceEntity: 'PERSON' },
    { code: 'employee.fullName', namespace: 'employee', name: 'Nombre completo', dataType: 'STRING', sourceEntity: 'PERSON', required: true },
    { code: 'employee.rut', namespace: 'employee', name: 'RUT', dataType: 'STRING', sourceEntity: 'PERSON', required: true },
    { code: 'employee.rutFormatted', namespace: 'employee', name: 'RUT formateado', dataType: 'STRING', sourceEntity: 'PERSON' },
    { code: 'employee.nationality', namespace: 'employee', name: 'Nacionalidad', dataType: 'STRING', sourceEntity: 'PERSON' },
    { code: 'employee.birthDate', namespace: 'employee', name: 'Fecha de nacimiento', dataType: 'DATE', sourceEntity: 'PERSON' },
    { code: 'employee.email', namespace: 'employee', name: 'Correo electrónico', dataType: 'STRING', sourceEntity: 'PERSON' },
    { code: 'employee.phone', namespace: 'employee', name: 'Teléfono', dataType: 'STRING', sourceEntity: 'PERSON' },
    { code: 'employee.address', namespace: 'employee', name: 'Dirección', dataType: 'STRING', sourceEntity: 'PERSON' },
    { code: 'employee.commune', namespace: 'employee', name: 'Comuna', dataType: 'STRING', sourceEntity: 'PERSON' },
    { code: 'employee.region', namespace: 'employee', name: 'Región', dataType: 'STRING', sourceEntity: 'PERSON' },

    { code: 'contract.contractNumber', namespace: 'contract', name: 'N° de contrato', dataType: 'STRING', sourceEntity: 'CONTRACT' },
    { code: 'contract.startDate', namespace: 'contract', name: 'Fecha de inicio', dataType: 'DATE', sourceEntity: 'CONTRACT', required: true },
    { code: 'contract.endDate', namespace: 'contract', name: 'Fecha de término', dataType: 'DATE', sourceEntity: 'CONTRACT' },
    { code: 'contract.baseSalary', namespace: 'contract', name: 'Sueldo base', dataType: 'DECIMAL', sourceEntity: 'CONTRACT' },
    { code: 'contract.weeklyHours', namespace: 'contract', name: 'Horas semanales', dataType: 'DECIMAL', sourceEntity: 'CONTRACT' },
    { code: 'contract.isFixedTerm', namespace: 'contract', name: '¿Es plazo fijo?', dataType: 'BOOLEAN', sourceEntity: 'CONTRACT' },
    { code: 'contract.legalRegimeName', namespace: 'contract', name: 'Régimen jurídico', dataType: 'STRING', sourceEntity: 'CONTRACT' },
    { code: 'contract.contractTypeName', namespace: 'contract', name: 'Tipo de contrato', dataType: 'STRING', sourceEntity: 'CONTRACT' },

    { code: 'position.title', namespace: 'position', name: 'Cargo/posición', dataType: 'STRING', sourceEntity: 'POSITION', required: true },
    { code: 'position.cargoName', namespace: 'position', name: 'Clasificación del cargo', dataType: 'STRING', sourceEntity: 'POSITION' },

    { code: 'costCenter.name', namespace: 'costCenter', name: 'Centro de costo', dataType: 'STRING', sourceEntity: 'COST_CENTER' },
    { code: 'costCenter.code', namespace: 'costCenter', name: 'Código centro de costo', dataType: 'STRING', sourceEntity: 'COST_CENTER' },

    { code: 'company.name', namespace: 'company', name: 'Nombre entidad legal', dataType: 'STRING', sourceEntity: 'LEGAL_ENTITY', required: true },
    { code: 'company.code', namespace: 'company', name: 'Código entidad legal', dataType: 'STRING', sourceEntity: 'LEGAL_ENTITY' },
    { code: 'company.rut', namespace: 'company', name: 'RUT empleador', dataType: 'STRING', sourceEntity: 'LEGAL_ENTITY' },
    { code: 'company.rutFormatted', namespace: 'company', name: 'RUT empleador formateado', dataType: 'STRING', sourceEntity: 'LEGAL_ENTITY' },
    { code: 'company.legalName', namespace: 'company', name: 'Razón social', dataType: 'STRING', sourceEntity: 'LEGAL_ENTITY' },
    { code: 'company.address', namespace: 'company', name: 'Domicilio', dataType: 'STRING', sourceEntity: 'LEGAL_ENTITY' },
    { code: 'company.city', namespace: 'company', name: 'Ciudad', dataType: 'STRING', sourceEntity: 'LEGAL_ENTITY' },
    { code: 'company.legalRepresentativeName', namespace: 'company', name: 'Representante legal', dataType: 'STRING', sourceEntity: 'LEGAL_ENTITY' },
    { code: 'company.legalRepresentativeRut', namespace: 'company', name: 'RUT representante legal', dataType: 'STRING', sourceEntity: 'LEGAL_ENTITY' },

    { code: 'compensation.baseSalary', namespace: 'compensation', name: 'Sueldo base vigente', dataType: 'DECIMAL', sourceEntity: 'CONTRACT', description: 'Alias de contract.baseSalary; ver limitación de historicidad en token-resolvers.ts' },

    { code: 'afp.name', namespace: 'afp', name: 'AFP', dataType: 'STRING', sourceEntity: 'EMPLOYEE_AFP' },
    { code: 'afp.workerRate', namespace: 'afp', name: 'Tasa de cotización AFP', dataType: 'DECIMAL', sourceEntity: 'EMPLOYEE_AFP' },

    { code: 'health.institutionName', namespace: 'health', name: 'Institución de salud', dataType: 'STRING', sourceEntity: 'HEALTH_AFFILIATION' },
    { code: 'health.institutionType', namespace: 'health', name: 'Tipo (Fonasa/Isapre)', dataType: 'STRING', sourceEntity: 'HEALTH_AFFILIATION' },
    { code: 'health.planUfValue', namespace: 'health', name: 'Plan Isapre (UF)', dataType: 'DECIMAL', sourceEntity: 'HEALTH_AFFILIATION' },

    { code: 'bankAccount.bankName', namespace: 'bankAccount', name: 'Banco', dataType: 'STRING', sourceEntity: 'EMPLOYEE_BANK_ACCOUNT' },
    { code: 'bankAccount.accountTypeName', namespace: 'bankAccount', name: 'Tipo de cuenta', dataType: 'STRING', sourceEntity: 'EMPLOYEE_BANK_ACCOUNT' },
    { code: 'bankAccount.accountHolderName', namespace: 'bankAccount', name: 'Titular de la cuenta', dataType: 'STRING', sourceEntity: 'EMPLOYEE_BANK_ACCOUNT' },
    { code: 'bankAccount.accountNumberMasked', namespace: 'bankAccount', name: 'N° de cuenta (enmascarado)', dataType: 'STRING', sourceEntity: 'EMPLOYEE_BANK_ACCOUNT', sensitive: true },

    { code: 'document.date', namespace: 'document', name: 'Fecha del documento', dataType: 'DATE', sourceEntity: 'SYSTEM', required: true },
    { code: 'document.effectiveDate', namespace: 'document', name: 'Fecha efectiva', dataType: 'DATE', sourceEntity: 'SYSTEM', required: true },
    { code: 'document.number', namespace: 'document', name: 'N° de documento', dataType: 'STRING', sourceEntity: 'SYSTEM' },

    { code: 'clauses', namespace: 'system', name: 'Cláusulas de la matriz', dataType: 'STRING', sourceEntity: 'SYSTEM', description: 'Placeholder estructural: el motor lo reemplaza por las cláusulas asignadas a la matriz, en orden.' },
  ];
  for (const t of documentTokens) {
    await prisma.documentTokenDefinition.upsert({ where: { code: t.code }, update: {}, create: t });
  }

  // --- Motor de Documentos Contractuales: cláusula, plantilla y matriz de ejemplo ---
  const claIdentificacion = await prisma.clause.upsert({
    where: { id: 'seed-clause-identificacion' },
    update: {},
    create: { id: 'seed-clause-identificacion', code: 'CLA_IDENTIFICACION', name: 'Identificación de las partes', status: 'ACTIVE' },
  });
  await prisma.clauseVersion.upsert({
    where: { id: 'seed-clause-identificacion-v1' },
    update: {},
    create: {
      id: 'seed-clause-identificacion-v1',
      clauseId: claIdentificacion.id,
      versionNumber: 1,
      status: 'PUBLISHED',
      publishedAt: effectiveFrom,
      publishedBy: 'seed',
      content:
        '<p>En {{company.city}}, a {{document.date|dateLong}}, entre {{company.legalName}}, RUT {{company.rutFormatted}}, ' +
        'representada por {{company.legalRepresentativeName}}, RUT {{company.legalRepresentativeRut}}, en adelante ' +
        '"el empleador"; y don(a) {{employee.fullName}}, RUT {{employee.rutFormatted}}, en adelante "el trabajador", ' +
        'se acuerda el siguiente contrato de trabajo:</p>',
    },
  });

  const claRemuneracion = await prisma.clause.upsert({
    where: { id: 'seed-clause-remuneracion' },
    update: {},
    create: { id: 'seed-clause-remuneracion', code: 'CLA_REMUNERACION', name: 'Remuneración', status: 'ACTIVE' },
  });
  await prisma.clauseVersion.upsert({
    where: { id: 'seed-clause-remuneracion-v1' },
    update: {},
    create: {
      id: 'seed-clause-remuneracion-v1',
      clauseId: claRemuneracion.id,
      versionNumber: 1,
      status: 'PUBLISHED',
      publishedAt: effectiveFrom,
      publishedBy: 'seed',
      content:
        '<p><strong>PRIMERO.</strong> El trabajador prestará servicios en calidad de {{position.title}}, a contar del ' +
        '{{contract.startDate|dateLong}}. La remuneración base será de {{compensation.baseSalary|currencyCLP}} ' +
        '({{compensation.baseSalary|currencyCLPWords}}) mensuales, por una jornada de {{contract.weeklyHours|decimal:1}} ' +
        'horas semanales.</p>\n' +
        '{{#if contract.isFixedTerm}}<p><strong>SEGUNDO.</strong> El presente contrato tendrá vigencia hasta el ' +
        '{{contract.endDate|dateLong}}.</p>{{/if}}',
    },
  });

  const contractTemplate = await prisma.contractTemplate.upsert({
    where: { id: 'seed-template-contrato-indefinido' },
    update: {},
    create: {
      id: 'seed-template-contrato-indefinido',
      code: 'TPL_CTR_INDEFINIDO_001',
      name: 'Contrato de trabajo — Código del Trabajo',
      documentType: 'CONTRATO',
      status: 'ACTIVE',
    },
  });
  const contractTemplateVersion = await prisma.contractTemplateVersion.upsert({
    where: { id: 'seed-template-contrato-indefinido-v1' },
    update: {},
    create: {
      id: 'seed-template-contrato-indefinido-v1',
      templateId: contractTemplate.id,
      versionNumber: 1,
      status: 'PUBLISHED',
      publishedAt: effectiveFrom,
      publishedBy: 'seed',
      content:
        '<h1 style="text-align:center">CONTRATO DE TRABAJO</h1>\n{{clauses}}\n' +
        '<table style="width:100%;margin-top:3rem"><tr>' +
        '<td style="text-align:center">____________________<br/>{{employee.fullName}}<br/>TRABAJADOR</td>' +
        '<td style="text-align:center">____________________<br/>{{company.legalRepresentativeName}}<br/>EMPLEADOR</td>' +
        '</tr></table>',
    },
  });

  const indefinido = await prisma.contractType.findUniqueOrThrow({
    where: { laborRegimeId_code: { laborRegimeId: codigoTrabajo.id, code: 'INDEFINIDO' } },
  });

  const contractMatrix = await prisma.contractMatrix.upsert({
    where: { id: 'seed-matrix-contrato-indefinido' },
    update: {},
    create: {
      id: 'seed-matrix-contrato-indefinido',
      code: 'CTR_INDEFINIDO_CODIGO_TRABAJO',
      name: 'Contrato indefinido — Código del Trabajo',
      documentType: 'CONTRATO',
      legalRegimeId: codigoTrabajo.id,
      contractTypeId: indefinido.id,
      templateId: contractTemplate.id,
      validFrom: effectiveFrom,
      status: 'ACTIVE',
    },
  });
  await prisma.matrixClause.upsert({
    where: { matrixId_clauseId: { matrixId: contractMatrix.id, clauseId: claIdentificacion.id } },
    update: {},
    create: { matrixId: contractMatrix.id, clauseId: claIdentificacion.id, sequence: 1, mandatory: true },
  });
  await prisma.matrixClause.upsert({
    where: { matrixId_clauseId: { matrixId: contractMatrix.id, clauseId: claRemuneracion.id } },
    update: {},
    create: { matrixId: contractMatrix.id, clauseId: claRemuneracion.id, sequence: 2, mandatory: true },
  });

  // --- Carrera Funcionaria APS (Ley N°19.378) — catálogos base ---
  // Sólo se siembran catálogos de clasificación (universales, definidos por la
  // ley/reglamento): categorías, tipos de capacitación e institución. NO se
  // siembran niveles de carrera, tramos de puntaje ni escalas de sueldo base
  // (ApsCareerLevel/ApsBaseSalaryScale/ApsNationalMinimumBaseSalary): esas
  // cifras dependen de la entidad administradora y de la normativa vigente al
  // momento de implantar, y deben cargarse desde el mantenedor con las cifras
  // reales — no corresponde adivinarlas aquí, a diferencia de un ejemplo de
  // comisión AFP.
  const laborRegimeAps = await prisma.laborRegime.findUniqueOrThrow({ where: { code: 'LEY_19378' } });

  const apsCategories = [
    { code: 'A', name: 'Médicos Cirujanos, Farmacéuticos, Químico-Farmacéuticos, Bioquímicos y Cirujano-Dentistas', qualificationLevel: 'Profesional', professionalRequired: true },
    { code: 'B', name: 'Otros profesionales', qualificationLevel: 'Profesional', professionalRequired: true },
    { code: 'C', name: 'Técnicos de nivel superior', qualificationLevel: 'Técnico de nivel superior', professionalRequired: false },
    { code: 'D', name: 'Técnicos de Salud', qualificationLevel: 'Técnico', professionalRequired: false },
    { code: 'E', name: 'Administrativos de Salud', qualificationLevel: 'Administrativo', professionalRequired: false },
    { code: 'F', name: 'Auxiliares de servicios de Salud', qualificationLevel: 'Auxiliar', professionalRequired: false },
  ];
  for (const cat of apsCategories) {
    await prisma.apsEmployeeCategory.upsert({
      where: { code: cat.code },
      update: {},
      create: { ...cat, effectiveFrom },
    });
  }

  // Tipos contractuales propios del Estatuto APS (la tabla ContractType ya
  // existe y es genérica por régimen — sólo se agregan filas nuevas).
  const apsContractTypes = [
    { code: 'TITULAR', name: 'Titular', requiresEndDate: false, allowsExtension: false, allowsIndefiniteConversion: false },
    { code: 'CONTRATA', name: 'Contrata', requiresEndDate: true, allowsExtension: true, allowsIndefiniteConversion: false },
    { code: 'SUPLENTE', name: 'Suplente', requiresEndDate: true, allowsExtension: true, allowsIndefiniteConversion: false },
  ];
  for (const ct of apsContractTypes) {
    await prisma.contractType.upsert({
      where: { laborRegimeId_code: { laborRegimeId: laborRegimeAps.id, code: ct.code } },
      update: {},
      create: { ...ct, laborRegimeId: laborRegimeAps.id, payrollRelevant: true, effectiveFrom },
    });
  }

  // --- Tipos y niveles de capacitación (Reglamento de Carrera Funcionaria) ---
  const apsTrainingTypes = [
    { code: 'COURSE', name: 'Curso' },
    { code: 'INTERNSHIP', name: 'Pasantía' },
    { code: 'WORKSHOP', name: 'Taller' },
    { code: 'SEMINAR', name: 'Seminario' },
    { code: 'DIPLOMA', name: 'Diplomado' },
    { code: 'SPECIALIZATION', name: 'Especialización' },
    { code: 'MISSION_STUDY', name: 'Estadía / misión de estudio' },
    { code: 'CONGRESS', name: 'Congreso' },
    { code: 'OTHER', name: 'Otro' },
  ];
  for (const t of apsTrainingTypes) {
    await prisma.apsTrainingType.upsert({ where: { code: t.code }, update: {}, create: t });
  }

  // Factores de nivel técnico según reglamento: bajo 1,0 / medio 1,1 / alto 1,2.
  const apsTechnicalLevels = [
    { code: 'LOW', name: 'Bajo', factor: 1.0 },
    { code: 'MEDIUM', name: 'Medio', factor: 1.1 },
    { code: 'HIGH', name: 'Alto', factor: 1.2 },
  ];
  for (const l of apsTechnicalLevels) {
    await prisma.apsTrainingTechnicalLevel.upsert({ where: { code: l.code }, update: {}, create: { ...l, effectiveFrom } });
  }

  // EJEMPLO: notas de corte de evaluación — el reglamento pondera con factores
  // entre 0,4 y 1,0; las notas de corte deben confirmarse contra el texto
  // vigente antes de usarse en producción (igual advertencia que AFP/UF/UTM).
  const apsEvaluationLevels = [
    { code: 'MINIMUM', name: 'Mínima', minimumGrade: 4.0, maximumGrade: 4.9, factor: 0.4 },
    { code: 'MEDIUM', name: 'Media', minimumGrade: 5.0, maximumGrade: 5.9, factor: 0.7 },
    { code: 'MAXIMUM', name: 'Máxima', minimumGrade: 6.0, maximumGrade: 7.0, factor: 1.0 },
  ];
  for (const e of apsEvaluationLevels) {
    await prisma.apsTrainingEvaluationLevel.upsert({ where: { code: e.code }, update: {}, create: { ...e, effectiveFrom } });
  }

  // --- Tipos de institución y de formación académica ---
  const educationInstitutionTypes = [
    { code: 'UNIVERSITY', name: 'Universidad' },
    { code: 'PROFESSIONAL_INSTITUTE', name: 'Instituto Profesional' },
    { code: 'TECHNICAL_TRAINING_CENTER', name: 'Centro de Formación Técnica' },
    { code: 'MINSAL', name: 'Ministerio de Salud' },
    { code: 'HEALTH_SERVICE', name: 'Servicio de Salud' },
    { code: 'MUNICIPALITY', name: 'Municipalidad' },
    { code: 'MUNICIPAL_CORPORATION', name: 'Corporación Municipal' },
    { code: 'OTEC', name: 'Organismo Técnico de Capacitación (OTEC)' },
    { code: 'PUBLIC_INSTITUTION', name: 'Institución pública' },
    { code: 'PRIVATE_INSTITUTION', name: 'Institución privada' },
    { code: 'INTERNATIONAL_INSTITUTION', name: 'Institución internacional' },
  ];
  for (const it of educationInstitutionTypes) {
    await prisma.educationInstitutionType.upsert({ where: { code: it.code }, update: {}, create: it });
  }

  const educationTypes = [
    { code: 'TECHNICAL_TITLE', name: 'Título técnico', countsForApsCareer: true },
    { code: 'PROFESSIONAL_TITLE', name: 'Título profesional', countsForApsCareer: true },
    { code: 'BACHELOR', name: 'Bachillerato', countsForApsCareer: false },
    { code: 'LICENCIATURA', name: 'Licenciatura', countsForApsCareer: false },
    { code: 'SPECIALTY', name: 'Especialidad', countsForApsCareer: true },
    { code: 'DIPLOMA', name: 'Diplomado', countsForApsCareer: true },
    { code: 'POSTGRADUATE_DIPLOMA', name: 'Diplomado de postgrado', countsForApsCareer: true },
    { code: 'MASTER', name: 'Magíster', countsForApsCareer: true },
    { code: 'DOCTORATE', name: 'Doctorado', countsForApsCareer: true },
    { code: 'POSTDOCTORATE', name: 'Postdoctorado', countsForApsCareer: true },
    { code: 'COURSE', name: 'Curso', countsForApsCareer: true },
    { code: 'INTERNSHIP', name: 'Pasantía', countsForApsCareer: true },
    { code: 'SEMINAR', name: 'Seminario', countsForApsCareer: true },
    { code: 'WORKSHOP', name: 'Taller', countsForApsCareer: true },
    { code: 'CONGRESS', name: 'Congreso', countsForApsCareer: false },
    { code: 'OTHER', name: 'Otro', countsForApsCareer: false },
  ];
  for (const et of educationTypes) {
    await prisma.educationType.upsert({ where: { code: et.code }, update: {}, create: et });
  }

  console.log('Seed completado.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
