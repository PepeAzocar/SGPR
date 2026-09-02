-- CreateEnum
CREATE TYPE "EmployeeEventStatus" AS ENUM ('APPLIED', 'CANCELLED');

-- CreateTable
CREATE TABLE "EventType" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(40) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "payrollRelevant" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventReason" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(40) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "eventTypeId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventReason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeEvent" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "sequenceNumber" INTEGER NOT NULL,
    "eventTypeId" TEXT NOT NULL,
    "eventReasonId" TEXT NOT NULL,
    "description" VARCHAR(500),
    "documentReference" VARCHAR(200),
    "laborRegimeId" TEXT,
    "payrollRelevant" BOOLEAN NOT NULL,
    "retroactive" BOOLEAN NOT NULL,
    "status" "EmployeeEventStatus" NOT NULL DEFAULT 'APPLIED',
    "createdBy" VARCHAR(150),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeEventChange" (
    "id" TEXT NOT NULL,
    "employeeEventId" TEXT NOT NULL,
    "fieldCode" VARCHAR(40) NOT NULL,
    "oldValue" VARCHAR(300),
    "newValue" VARCHAR(300),
    "oldReferenceId" TEXT,
    "newReferenceId" TEXT,

    CONSTRAINT "EmployeeEventChange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EventType_code_key" ON "EventType"("code");

-- CreateIndex
CREATE UNIQUE INDEX "EventReason_eventTypeId_code_key" ON "EventReason"("eventTypeId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeEvent_employeeId_sequenceNumber_key" ON "EmployeeEvent"("employeeId", "sequenceNumber");

-- AddForeignKey
ALTER TABLE "EventReason" ADD CONSTRAINT "EventReason_eventTypeId_fkey" FOREIGN KEY ("eventTypeId") REFERENCES "EventType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeEvent" ADD CONSTRAINT "EmployeeEvent_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeEvent" ADD CONSTRAINT "EmployeeEvent_eventTypeId_fkey" FOREIGN KEY ("eventTypeId") REFERENCES "EventType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeEvent" ADD CONSTRAINT "EmployeeEvent_eventReasonId_fkey" FOREIGN KEY ("eventReasonId") REFERENCES "EventReason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeEvent" ADD CONSTRAINT "EmployeeEvent_laborRegimeId_fkey" FOREIGN KEY ("laborRegimeId") REFERENCES "LaborRegime"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeEventChange" ADD CONSTRAINT "EmployeeEventChange_employeeEventId_fkey" FOREIGN KEY ("employeeEventId") REFERENCES "EmployeeEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

