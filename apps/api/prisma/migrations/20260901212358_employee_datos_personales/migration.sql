-- AlterTable: agrega los nuevos campos de "Datos Personales" como nullable primero,
-- para poder rellenar los registros existentes antes de exigir NOT NULL.
ALTER TABLE "Employee" ADD COLUMN     "birthCommune" VARCHAR(80),
ADD COLUMN     "birthCountry" VARCHAR(80),
ADD COLUMN     "birthRegion" VARCHAR(80),
ADD COLUMN     "documentNumber" VARCHAR(30),
ADD COLUMN     "documentType" VARCHAR(20),
ADD COLUMN     "photoUrl" VARCHAR(500),
ADD COLUMN     "socialName" VARCHAR(150),
ALTER COLUMN "rut" DROP NOT NULL,
ALTER COLUMN "rut" SET DATA TYPE VARCHAR(12);

-- Backfill: los empleados existentes se identificaron por RUT, así que se usa
-- ese valor como su documento de identidad.
UPDATE "Employee" SET "documentType" = 'RUT', "documentNumber" = "rut" WHERE "documentNumber" IS NULL;

-- Ahora que todas las filas tienen valor, se exige NOT NULL como en el esquema.
ALTER TABLE "Employee" ALTER COLUMN "documentType" SET NOT NULL;
ALTER TABLE "Employee" ALTER COLUMN "documentNumber" SET NOT NULL;
