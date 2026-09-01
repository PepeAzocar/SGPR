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
    await prisma.afpEntity.upsert({ where: { name: afp.name }, update: {}, create: afp });
  }

  // --- Instituciones de salud ---
  await prisma.healthInstitution.upsert({
    where: { name: 'Fonasa' },
    update: {},
    create: { name: 'Fonasa', type: 'FONASA' },
  });
  const isapres = ['Banmédica', 'Colmena', 'Cruz Blanca', 'Consalud', 'Nueva Masvida'];
  for (const name of isapres) {
    await prisma.healthInstitution.upsert({ where: { name }, update: {}, create: { name, type: 'ISAPRE' } });
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

  // --- Departamento y cargo de ejemplo ---
  const dept = await prisma.department.upsert({
    where: { id: 'seed-dept-admin' },
    update: {},
    create: { id: 'seed-dept-admin', name: 'Administración y Finanzas' },
  });
  await prisma.position.upsert({
    where: { id: 'seed-position-analista' },
    update: {},
    create: { id: 'seed-position-analista', title: 'Analista de Remuneraciones', departmentId: dept.id },
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
