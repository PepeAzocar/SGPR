-- CreateEnum
CREATE TYPE "AffiliationStatus" AS ENUM ('ACTIVE', 'FINISHED', 'PENDING');

-- CreateEnum
CREATE TYPE "PensionProductType" AS ENUM ('APV', 'CAV', 'COTIZACION_VOLUNTARIA', 'DEPOSITO_CONVENIDO');

-- CreateEnum
CREATE TYPE "ContributionMode" AS ENUM ('MONTO', 'PORCENTAJE');

-- CreateEnum
CREATE TYPE "PensionSavingStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'FINISHED');

-- CreateTable
CREATE TABLE "EmployeeAfp" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "afpId" TEXT NOT NULL,
    "affiliationDate" TIMESTAMP(3) NOT NULL,
    "afpJoinDate" TIMESTAMP(3) NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "status" "AffiliationStatus" NOT NULL DEFAULT 'ACTIVE',
    "fundType" CHAR(1),
    "mandatoryContributionPct" DECIMAL(6,3) NOT NULL DEFAULT 10.000,
    "afpCommissionPct" DECIMAL(6,3),
    "additionalContributionPct" DECIMAL(6,3),
    "heavyWork" BOOLEAN NOT NULL DEFAULT false,
    "heavyWorkPct" DECIMAL(5,2),
    "notes" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeAfp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeePensionSaving" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "productType" "PensionProductType" NOT NULL,
    "institutionId" TEXT NOT NULL,
    "taxRegime" CHAR(1),
    "contributionMode" "ContributionMode" NOT NULL,
    "amount" DECIMAL(15,2),
    "percentage" DECIMAL(7,4),
    "currency" VARCHAR(10) DEFAULT 'CLP',
    "fundType" CHAR(1),
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "status" "PensionSavingStatus" NOT NULL DEFAULT 'ACTIVE',
    "payrollDeduction" BOOLEAN NOT NULL DEFAULT true,
    "contractNumber" VARCHAR(50),
    "notes" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeePensionSaving_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthAffiliation" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "healthInstitutionId" TEXT NOT NULL,
    "planUfValue" DECIMAL(10,4),
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "status" "AffiliationStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HealthAffiliation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EmployeeAfp" ADD CONSTRAINT "EmployeeAfp_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EmployeeAfp" ADD CONSTRAINT "EmployeeAfp_afpId_fkey" FOREIGN KEY ("afpId") REFERENCES "AfpEntity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeePensionSaving" ADD CONSTRAINT "EmployeePensionSaving_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EmployeePensionSaving" ADD CONSTRAINT "EmployeePensionSaving_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "AfpEntity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthAffiliation" ADD CONSTRAINT "HealthAffiliation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "HealthAffiliation" ADD CONSTRAINT "HealthAffiliation_healthInstitutionId_fkey" FOREIGN KEY ("healthInstitutionId") REFERENCES "HealthInstitution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Backfill: cada empleado que ya tenía afpId / healthInstitutionId directo pasa a tener
-- un registro de afiliación vigente (effectiveFrom = fecha de creación del empleado,
-- effectiveTo = NULL, estado ACTIVE), sin perder la información existente.
INSERT INTO "EmployeeAfp" (
    "id", "employeeId", "afpId", "affiliationDate", "afpJoinDate", "effectiveFrom",
    "status", "mandatoryContributionPct", "afpCommissionPct", "heavyWork", "createdAt", "updatedAt"
)
SELECT
    gen_random_uuid()::text,
    e."id",
    e."afpId",
    e."createdAt",
    e."createdAt",
    e."createdAt",
    'ACTIVE',
    10.000,
    GREATEST(a."workerRate" - 10.000, 0),
    false,
    now(),
    now()
FROM "Employee" e
JOIN "AfpEntity" a ON a."id" = e."afpId"
WHERE e."afpId" IS NOT NULL;

INSERT INTO "HealthAffiliation" (
    "id", "employeeId", "healthInstitutionId", "planUfValue", "effectiveFrom", "status", "createdAt", "updatedAt"
)
SELECT
    gen_random_uuid()::text,
    e."id",
    e."healthInstitutionId",
    e."isapreUfPlan",
    e."createdAt",
    'ACTIVE',
    now(),
    now()
FROM "Employee" e
WHERE e."healthInstitutionId" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_afpId_fkey";
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_healthInstitutionId_fkey";

-- AlterTable: los datos ya migraron a EmployeeAfp / HealthAffiliation.
ALTER TABLE "Employee" DROP COLUMN "afpId",
DROP COLUMN "healthInstitutionId",
DROP COLUMN "isapreUfPlan";
