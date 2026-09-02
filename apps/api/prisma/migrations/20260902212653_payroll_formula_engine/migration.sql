-- CreateEnum
CREATE TYPE "PayrollFormulaStatus" AS ENUM ('DRAFT', 'TESTING', 'PENDING_APPROVAL', 'APPROVED', 'ACTIVE', 'INACTIVE', 'REJECTED');

-- CreateEnum
CREATE TYPE "PayrollVariableSource" AS ENUM ('EMPLOYEE', 'CONTRACT', 'INDICATOR', 'PARAMETER', 'TABLE', 'SYSTEM');

-- CreateTable
CREATE TABLE "PayrollVariable" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" VARCHAR(300),
    "source" "PayrollVariableSource" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayrollVariable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollParameter" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" VARCHAR(300),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayrollParameter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollParameterValue" (
    "id" TEXT NOT NULL,
    "parameterId" TEXT NOT NULL,
    "value" DECIMAL(14,6) NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayrollParameterValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollTable" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayrollTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollTableRow" (
    "id" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "fromValue" DECIMAL(14,4) NOT NULL,
    "toValue" DECIMAL(14,4),
    "resultValue" DECIMAL(14,6) NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),

    CONSTRAINT "PayrollTableRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollFormula" (
    "id" TEXT NOT NULL,
    "conceptId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "formulaExpression" VARCHAR(2000) NOT NULL,
    "condition" VARCHAR(1000),
    "laborRegimeId" TEXT,
    "legalEntityId" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 500,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "status" "PayrollFormulaStatus" NOT NULL DEFAULT 'DRAFT',
    "createdBy" VARCHAR(150),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "approvedBy" VARCHAR(150),
    "approvedAt" TIMESTAMP(3),

    CONSTRAINT "PayrollFormula_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PayrollVariable_code_key" ON "PayrollVariable"("code");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollParameter_code_key" ON "PayrollParameter"("code");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollTable_code_key" ON "PayrollTable"("code");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollFormula_conceptId_version_key" ON "PayrollFormula"("conceptId", "version");

-- AddForeignKey
ALTER TABLE "PayrollParameterValue" ADD CONSTRAINT "PayrollParameterValue_parameterId_fkey" FOREIGN KEY ("parameterId") REFERENCES "PayrollParameter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollTableRow" ADD CONSTRAINT "PayrollTableRow_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "PayrollTable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollFormula" ADD CONSTRAINT "PayrollFormula_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "PayrollConcept"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollFormula" ADD CONSTRAINT "PayrollFormula_laborRegimeId_fkey" FOREIGN KEY ("laborRegimeId") REFERENCES "LaborRegime"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollFormula" ADD CONSTRAINT "PayrollFormula_legalEntityId_fkey" FOREIGN KEY ("legalEntityId") REFERENCES "LegalEntity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

