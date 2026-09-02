-- AlterTable
ALTER TABLE "AfpEntity" ADD COLUMN     "effectiveFrom" TIMESTAMP(3),
ADD COLUMN     "effectiveTo" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "HealthInstitution" ADD COLUMN     "effectiveFrom" TIMESTAMP(3),
ADD COLUMN     "effectiveTo" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Mutuality" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "rut" VARCHAR(12) NOT NULL,
    "legalName" VARCHAR(150) NOT NULL,
    "tradeName" VARCHAR(100),
    "address" VARCHAR(200),
    "phone" VARCHAR(30),
    "email" VARCHAR(150),
    "website" VARCHAR(200),
    "previredCode" VARCHAR(20),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "createdBy" VARCHAR(150),
    "updatedBy" VARCHAR(150),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mutuality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ccaf" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "rut" VARCHAR(12) NOT NULL,
    "legalName" VARCHAR(150) NOT NULL,
    "tradeName" VARCHAR(100),
    "address" VARCHAR(200),
    "phone" VARCHAR(30),
    "email" VARCHAR(150),
    "website" VARCHAR(200),
    "previredCode" VARCHAR(20),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "createdBy" VARCHAR(150),
    "updatedBy" VARCHAR(150),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ccaf_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Mutuality_code_key" ON "Mutuality"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Ccaf_code_key" ON "Ccaf"("code");

