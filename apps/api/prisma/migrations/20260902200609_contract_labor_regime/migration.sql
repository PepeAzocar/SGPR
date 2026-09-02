-- AlterTable
ALTER TABLE "Contract" DROP COLUMN "type",
ADD COLUMN     "contractNumber" VARCHAR(30) NOT NULL,
ADD COLUMN     "contractTypeId" TEXT NOT NULL,
ADD COLUMN     "laborRegimeId" TEXT NOT NULL,
ADD COLUMN     "legalEntityId" TEXT NOT NULL,
ADD COLUMN     "sequenceNumber" INTEGER NOT NULL DEFAULT 1;

-- DropEnum
DROP TYPE "ContractType";

-- CreateTable
CREATE TABLE "LaborRegime" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "mainNorm" VARCHAR(200),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LaborRegime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractType" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "laborRegimeId" TEXT NOT NULL,
    "requiresEndDate" BOOLEAN NOT NULL DEFAULT false,
    "allowsExtension" BOOLEAN NOT NULL DEFAULT false,
    "allowsIndefiniteConversion" BOOLEAN NOT NULL DEFAULT false,
    "payrollRelevant" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LaborRegime_code_key" ON "LaborRegime"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ContractType_laborRegimeId_code_key" ON "ContractType"("laborRegimeId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_legalEntityId_contractNumber_key" ON "Contract"("legalEntityId", "contractNumber");

-- AddForeignKey
ALTER TABLE "ContractType" ADD CONSTRAINT "ContractType_laborRegimeId_fkey" FOREIGN KEY ("laborRegimeId") REFERENCES "LaborRegime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_legalEntityId_fkey" FOREIGN KEY ("legalEntityId") REFERENCES "LegalEntity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_laborRegimeId_fkey" FOREIGN KEY ("laborRegimeId") REFERENCES "LaborRegime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_contractTypeId_fkey" FOREIGN KEY ("contractTypeId") REFERENCES "ContractType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

