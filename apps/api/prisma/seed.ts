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
  const legalEntity = await prisma.legalEntity.upsert({
    where: { id: 'seed-legal-entity' },
    update: {},
    create: {
      id: 'seed-legal-entity',
      code: 'LE-001',
      name: 'Imaginadem SpA',
      effectiveFrom,
      status: 'ACTIVE',
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
