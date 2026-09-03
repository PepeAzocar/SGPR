/*
  Warnings:

  - You are about to drop the `Payslip` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PayslipItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PayrollRunType" AS ENUM ('REGULAR', 'CORRECTION', 'RETROACTIVE', 'OFF_CYCLE');

-- CreateEnum
CREATE TYPE "PayrollRunStatus" AS ENUM ('RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "PayrollResultStatus" AS ENUM ('CALCULATED', 'SUPERSEDED', 'FINAL', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PayrollCalculationMode" AS ENUM ('FULL', 'DIFFERENCE');

-- CreateEnum
CREATE TYPE "PayrollDetailOrigin" AS ENUM ('CONTRACT', 'PERSON_MASTER', 'RECURRING_MOVEMENT', 'VARIABLE_MOVEMENT', 'ABSENCE', 'ATTENDANCE', 'SYSTEM_CALCULATION', 'RETROACTIVE', 'MANUAL', 'CORRECTION');

-- DropForeignKey
ALTER TABLE "Payslip" DROP CONSTRAINT "Payslip_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "Payslip" DROP CONSTRAINT "Payslip_periodId_fkey";

-- DropForeignKey
ALTER TABLE "PayslipItem" DROP CONSTRAINT "PayslipItem_conceptId_fkey";

-- DropForeignKey
ALTER TABLE "PayslipItem" DROP CONSTRAINT "PayslipItem_payslipId_fkey";

-- AlterTable
ALTER TABLE "PayrollPeriod" ADD COLUMN     "paymentDate" TIMESTAMP(3);

-- DropTable
DROP TABLE "Payslip";

-- DropTable
DROP TABLE "PayslipItem";

-- CreateTable
CREATE TABLE "PayrollRun" (
    "id" TEXT NOT NULL,
    "payrollPeriodId" TEXT NOT NULL,
    "runNumber" INTEGER NOT NULL,
    "runType" "PayrollRunType" NOT NULL,
    "correctionNumber" INTEGER,
    "description" VARCHAR(255),
    "calculationDate" TIMESTAMP(3),
    "status" "PayrollRunStatus" NOT NULL DEFAULT 'RUNNING',
    "parentRunId" TEXT,
    "createdBy" VARCHAR(150),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayrollRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollResult" (
    "id" TEXT NOT NULL,
    "payrollRunId" TEXT NOT NULL,
    "payrollPeriodId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "resultSequence" INTEGER NOT NULL,
    "resultType" "PayrollRunType" NOT NULL,
    "parentResultId" TEXT,
    "effectiveDate" TIMESTAMP(3),
    "calculationDate" TIMESTAMP(3) NOT NULL,
    "calculationMode" "PayrollCalculationMode" NOT NULL DEFAULT 'FULL',
    "currencyCode" VARCHAR(3) NOT NULL DEFAULT 'CLP',
    "totalEarnings" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "taxableEarnings" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "nonTaxableEarnings" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "totalDeductions" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "totalLegalDeductions" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "totalOtherDeductions" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "totalTaxable" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "totalPensionable" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "totalHealthBase" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "netAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "previousNetAmount" DECIMAL(18,2),
    "differenceAmount" DECIMAL(18,2),
    "status" "PayrollResultStatus" NOT NULL DEFAULT 'CALCULATED',
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" VARCHAR(150),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayrollResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollResultDetail" (
    "id" TEXT NOT NULL,
    "payrollResultId" TEXT NOT NULL,
    "conceptId" TEXT NOT NULL,
    "conceptCode" VARCHAR(30) NOT NULL,
    "conceptName" VARCHAR(200) NOT NULL,
    "conceptType" "ConceptType" NOT NULL,
    "sequence" INTEGER,
    "quantity" DECIMAL(18,6),
    "rate" DECIMAL(18,6),
    "baseAmount" DECIMAL(18,2),
    "amount" DECIMAL(18,2) NOT NULL,
    "taxable" BOOLEAN NOT NULL DEFAULT false,
    "pensionable" BOOLEAN NOT NULL DEFAULT false,
    "healthTaxable" BOOLEAN NOT NULL DEFAULT false,
    "unemploymentTaxable" BOOLEAN NOT NULL DEFAULT false,
    "incomeTaxable" BOOLEAN NOT NULL DEFAULT false,
    "employerCost" BOOLEAN NOT NULL DEFAULT false,
    "origin" "PayrollDetailOrigin",
    "sourceRecordId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayrollResultDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollResultEmployment" (
    "id" TEXT NOT NULL,
    "payrollResultId" TEXT NOT NULL,
    "legalEntityId" TEXT,
    "legalEntityName" VARCHAR(150),
    "costCenterId" TEXT,
    "costCenterName" VARCHAR(150),
    "departmentId" TEXT,
    "departmentName" VARCHAR(150),
    "positionId" TEXT,
    "positionTitle" VARCHAR(200),
    "contractTypeId" TEXT,
    "contractTypeName" VARCHAR(100),
    "weeklyHours" DECIMAL(8,2),
    "baseSalary" DECIMAL(18,2),
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayrollResultEmployment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PayrollRun_payrollPeriodId_runNumber_key" ON "PayrollRun"("payrollPeriodId", "runNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollResult_employeeId_payrollPeriodId_resultSequence_key" ON "PayrollResult"("employeeId", "payrollPeriodId", "resultSequence");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollResultEmployment_payrollResultId_key" ON "PayrollResultEmployment"("payrollResultId");

-- AddForeignKey
ALTER TABLE "PayrollRun" ADD CONSTRAINT "PayrollRun_payrollPeriodId_fkey" FOREIGN KEY ("payrollPeriodId") REFERENCES "PayrollPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollRun" ADD CONSTRAINT "PayrollRun_parentRunId_fkey" FOREIGN KEY ("parentRunId") REFERENCES "PayrollRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollResult" ADD CONSTRAINT "PayrollResult_payrollRunId_fkey" FOREIGN KEY ("payrollRunId") REFERENCES "PayrollRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollResult" ADD CONSTRAINT "PayrollResult_payrollPeriodId_fkey" FOREIGN KEY ("payrollPeriodId") REFERENCES "PayrollPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollResult" ADD CONSTRAINT "PayrollResult_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollResult" ADD CONSTRAINT "PayrollResult_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollResult" ADD CONSTRAINT "PayrollResult_parentResultId_fkey" FOREIGN KEY ("parentResultId") REFERENCES "PayrollResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollResultDetail" ADD CONSTRAINT "PayrollResultDetail_payrollResultId_fkey" FOREIGN KEY ("payrollResultId") REFERENCES "PayrollResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollResultDetail" ADD CONSTRAINT "PayrollResultDetail_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "PayrollConcept"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollResultEmployment" ADD CONSTRAINT "PayrollResultEmployment_payrollResultId_fkey" FOREIGN KEY ("payrollResultId") REFERENCES "PayrollResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;
