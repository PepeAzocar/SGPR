-- CreateEnum
CREATE TYPE "ContractMatrixStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "TemplateVersionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'RETIRED');

-- CreateEnum
CREATE TYPE "ClauseVersionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'RETIRED');

-- CreateEnum
CREATE TYPE "GeneratedDocumentStatus" AS ENUM ('GENERATED', 'CANCELLED');

-- AlterTable
ALTER TABLE "LegalEntity" ADD COLUMN     "address" VARCHAR(300),
ADD COLUMN     "city" VARCHAR(100),
ADD COLUMN     "legalName" VARCHAR(200),
ADD COLUMN     "legalRepresentativeName" VARCHAR(200),
ADD COLUMN     "legalRepresentativeRut" VARCHAR(12),
ADD COLUMN     "rut" VARCHAR(12);

-- CreateTable
CREATE TABLE "ContractMatrix" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(80) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "documentType" VARCHAR(30) NOT NULL,
    "legalRegimeId" TEXT,
    "contractTypeId" TEXT,
    "templateId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 500,
    "automaticGeneration" BOOLEAN NOT NULL DEFAULT false,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "requiresSignature" BOOLEAN NOT NULL DEFAULT false,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3),
    "status" "ContractMatrixStatus" NOT NULL DEFAULT 'DRAFT',
    "createdBy" VARCHAR(150),
    "updatedBy" VARCHAR(150),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractMatrix_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractTemplate" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(80) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "documentType" VARCHAR(30) NOT NULL,
    "status" "OrgUnitStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdBy" VARCHAR(150),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractTemplateVersion" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "status" "TemplateVersionStatus" NOT NULL DEFAULT 'DRAFT',
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "publishedBy" VARCHAR(150),
    "createdBy" VARCHAR(150),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContractTemplateVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clause" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(80) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" VARCHAR(500),
    "status" "OrgUnitStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdBy" VARCHAR(150),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clause_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClauseVersion" (
    "id" TEXT NOT NULL,
    "clauseId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "status" "ClauseVersionStatus" NOT NULL DEFAULT 'DRAFT',
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "publishedBy" VARCHAR(150),
    "createdBy" VARCHAR(150),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClauseVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatrixClause" (
    "id" TEXT NOT NULL,
    "matrixId" TEXT NOT NULL,
    "clauseId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "mandatory" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MatrixClause_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentTokenDefinition" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "namespace" VARCHAR(50) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "dataType" VARCHAR(20) NOT NULL,
    "description" VARCHAR(300),
    "sourceEntity" VARCHAR(50),
    "required" BOOLEAN NOT NULL DEFAULT false,
    "sensitive" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentTokenDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedDocument" (
    "id" TEXT NOT NULL,
    "documentNumber" VARCHAR(40) NOT NULL,
    "matrixId" TEXT NOT NULL,
    "matrixCodeSnapshot" VARCHAR(80) NOT NULL,
    "templateVersionId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "documentType" VARCHAR(30) NOT NULL,
    "documentDate" TIMESTAMP(3) NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generatedBy" VARCHAR(150),
    "status" "GeneratedDocumentStatus" NOT NULL DEFAULT 'GENERATED',
    "content" TEXT NOT NULL,
    "contentHash" VARCHAR(64) NOT NULL,
    "cancelledAt" TIMESTAMP(3),
    "cancelledBy" VARCHAR(150),
    "cancelReason" VARCHAR(300),

    CONSTRAINT "GeneratedDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedDocumentToken" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "tokenCode" VARCHAR(100) NOT NULL,
    "rawValue" VARCHAR(500),
    "formattedValue" VARCHAR(500),
    "sourceEntity" VARCHAR(50),
    "sourceRecordId" TEXT,

    CONSTRAINT "GeneratedDocumentToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContractTemplate_code_key" ON "ContractTemplate"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ContractTemplateVersion_templateId_versionNumber_key" ON "ContractTemplateVersion"("templateId", "versionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Clause_code_key" ON "Clause"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ClauseVersion_clauseId_versionNumber_key" ON "ClauseVersion"("clauseId", "versionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "MatrixClause_matrixId_clauseId_key" ON "MatrixClause"("matrixId", "clauseId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentTokenDefinition_code_key" ON "DocumentTokenDefinition"("code");

-- CreateIndex
CREATE UNIQUE INDEX "GeneratedDocument_documentNumber_key" ON "GeneratedDocument"("documentNumber");

-- AddForeignKey
ALTER TABLE "ContractMatrix" ADD CONSTRAINT "ContractMatrix_legalRegimeId_fkey" FOREIGN KEY ("legalRegimeId") REFERENCES "LaborRegime"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractMatrix" ADD CONSTRAINT "ContractMatrix_contractTypeId_fkey" FOREIGN KEY ("contractTypeId") REFERENCES "ContractType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractMatrix" ADD CONSTRAINT "ContractMatrix_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ContractTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractTemplateVersion" ADD CONSTRAINT "ContractTemplateVersion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ContractTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClauseVersion" ADD CONSTRAINT "ClauseVersion_clauseId_fkey" FOREIGN KEY ("clauseId") REFERENCES "Clause"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatrixClause" ADD CONSTRAINT "MatrixClause_matrixId_fkey" FOREIGN KEY ("matrixId") REFERENCES "ContractMatrix"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatrixClause" ADD CONSTRAINT "MatrixClause_clauseId_fkey" FOREIGN KEY ("clauseId") REFERENCES "Clause"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedDocument" ADD CONSTRAINT "GeneratedDocument_matrixId_fkey" FOREIGN KEY ("matrixId") REFERENCES "ContractMatrix"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedDocument" ADD CONSTRAINT "GeneratedDocument_templateVersionId_fkey" FOREIGN KEY ("templateVersionId") REFERENCES "ContractTemplateVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedDocument" ADD CONSTRAINT "GeneratedDocument_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedDocument" ADD CONSTRAINT "GeneratedDocument_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedDocumentToken" ADD CONSTRAINT "GeneratedDocumentToken_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "GeneratedDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
