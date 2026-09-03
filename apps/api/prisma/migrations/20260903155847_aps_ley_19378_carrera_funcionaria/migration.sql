-- CreateEnum
CREATE TYPE "ApsAdministrativeEntityType" AS ENUM ('MUNICIPALITY', 'MUNICIPAL_CORPORATION', 'NON_PROFIT_ADMINISTRATOR', 'OTHER_LEGAL_ENTITY');

-- CreateEnum
CREATE TYPE "ApsUrbanRural" AS ENUM ('URBAN', 'RURAL');

-- CreateEnum
CREATE TYPE "ApsBienniumStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'RECOGNIZED', 'SUSPENDED', 'ANNULLED');

-- CreateEnum
CREATE TYPE "ApsServiceExclusionType" AS ENUM ('UNPAID_LEAVE', 'UNRECOGNIZED_SERVICE', 'SERVICE_INTERRUPTION', 'OTHER');

-- CreateEnum
CREATE TYPE "ApsAcademicStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'RECOGNIZED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ApsTrainingParticipationStatus" AS ENUM ('REGISTERED', 'IN_PROGRESS', 'APPROVED', 'FAILED', 'RECOGNIZED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ApsCareerEventType" AS ENUM ('CAREER_ENTRY', 'CATEGORY_CHANGE', 'BIENNIUM_RECOGNITION', 'TRAINING_RECOGNITION', 'LEVEL_CHANGE', 'TITLE_RECOGNITION', 'POSTGRADUATE_RECOGNITION', 'MERIT_EVALUATION', 'MERIT_ASSIGNMENT', 'POSITION_CHANGE', 'RESPONSIBILITY_ASSIGNMENT', 'CAREER_RECALCULATION', 'RECTIFICATION');

-- CreateEnum
CREATE TYPE "ApsProgramStatus" AS ENUM ('DRAFT', 'APPROVED', 'IN_EXECUTION', 'CLOSED');

-- CreateTable
CREATE TABLE "LegalParameter" (
    "id" TEXT NOT NULL,
    "laborRegimeId" TEXT,
    "parameterCode" VARCHAR(80) NOT NULL,
    "parameterName" VARCHAR(200) NOT NULL,
    "numericValue" DECIMAL(18,6),
    "textValue" VARCHAR(300),
    "booleanValue" BOOLEAN,
    "category" VARCHAR(60),
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "legalReference" VARCHAR(200),
    "articleNumber" VARCHAR(20),
    "version" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" VARCHAR(150),
    "updatedBy" VARCHAR(150),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalParameter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApsAdministrativeEntityProfile" (
    "id" TEXT NOT NULL,
    "legalEntityId" TEXT NOT NULL,
    "entityType" "ApsAdministrativeEntityType" NOT NULL,
    "municipalityCommuneId" TEXT,
    "healthServiceId" TEXT,
    "regionId" TEXT,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApsAdministrativeEntityProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApsHealthService" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "regionId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApsHealthService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApsFacilityType" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApsFacilityType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApsHealthFacility" (
    "id" TEXT NOT NULL,
    "administrativeEntityId" TEXT NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "facilityTypeId" TEXT NOT NULL,
    "urbanRural" "ApsUrbanRural" NOT NULL,
    "address" VARCHAR(300),
    "communeId" TEXT NOT NULL,
    "healthServiceId" TEXT,
    "divisionId" TEXT,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" VARCHAR(150),
    "updatedBy" VARCHAR(150),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApsHealthFacility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApsEmployeeCategory" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(5) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" VARCHAR(500),
    "qualificationLevel" VARCHAR(50),
    "professionalRequired" BOOLEAN NOT NULL DEFAULT false,
    "minimumSemesters" INTEGER,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApsEmployeeCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApsProfession" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(40) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "categoryId" TEXT NOT NULL,
    "professionalTitleRequired" BOOLEAN NOT NULL DEFAULT false,
    "minimumSemesters" INTEGER,
    "healthRegistryRequired" BOOLEAN NOT NULL DEFAULT false,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApsProfession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApsCareerLevel" (
    "id" TEXT NOT NULL,
    "administrativeEntityId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "levelNumber" INTEGER NOT NULL,
    "minimumPoints" DECIMAL(10,4) NOT NULL,
    "maximumPoints" DECIMAL(10,4),
    "trainingPercentage" DECIMAL(14,6),
    "experiencePercentage" DECIMAL(14,6),
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApsCareerLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApsBaseSalaryScale" (
    "id" TEXT NOT NULL,
    "administrativeEntityId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "careerLevel" INTEGER NOT NULL,
    "weeklyHours" INTEGER NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "approvalReference" VARCHAR(200),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApsBaseSalaryScale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApsNationalMinimumBaseSalary" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "weeklyHoursReference" INTEGER NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "legalReference" VARCHAR(200),
    "publicationDate" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApsNationalMinimumBaseSalary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApsCareer" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "administrativeEntityId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "currentLevel" INTEGER NOT NULL,
    "experiencePoints" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "trainingPoints" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "totalPoints" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "recognizedBienniums" INTEGER NOT NULL DEFAULT 0,
    "careerStartDate" TIMESTAMP(3) NOT NULL,
    "levelEffectiveDate" TIMESTAMP(3) NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "status" VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApsCareer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApsCareerHistory" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "eventType" "ApsCareerEventType" NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT,
    "previousLevel" INTEGER,
    "newLevel" INTEGER,
    "experiencePoints" DECIMAL(10,4),
    "trainingPoints" DECIMAL(10,4),
    "totalPoints" DECIMAL(10,4),
    "bienniums" INTEGER,
    "resolutionNumber" VARCHAR(60),
    "resolutionDate" TIMESTAMP(3),
    "description" VARCHAR(500),
    "sourceEntity" VARCHAR(60),
    "sourceId" TEXT,
    "employeeEventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" VARCHAR(150),

    CONSTRAINT "ApsCareerHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApsLaborInstitution" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "institutionType" VARCHAR(40) NOT NULL,
    "aps" BOOLEAN NOT NULL DEFAULT false,
    "publicSector" BOOLEAN NOT NULL DEFAULT false,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" VARCHAR(150),
    "updatedBy" VARCHAR(150),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApsLaborInstitution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApsRecognizedService" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "bienniumId" TEXT,
    "serviceType" VARCHAR(40) NOT NULL,
    "legalRelationship" VARCHAR(40),
    "positionName" VARCHAR(150),
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "calendarDays" INTEGER NOT NULL,
    "recognizedDays" INTEGER NOT NULL,
    "excludedDays" INTEGER NOT NULL DEFAULT 0,
    "apsService" BOOLEAN NOT NULL DEFAULT false,
    "publicService" BOOLEAN NOT NULL DEFAULT false,
    "municipalService" BOOLEAN NOT NULL DEFAULT false,
    "recognized" BOOLEAN NOT NULL DEFAULT false,
    "recognitionDate" TIMESTAMP(3),
    "resolutionNumber" VARCHAR(60),
    "resolutionDate" TIMESTAMP(3),
    "documentId" TEXT,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "status" VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApsRecognizedService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApsServiceExclusion" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "exclusionType" "ApsServiceExclusionType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "days" INTEGER NOT NULL,
    "affectsBiennium" BOOLEAN NOT NULL DEFAULT true,
    "reason" VARCHAR(300),
    "legalReference" VARCHAR(200),
    "documentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApsServiceExclusion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApsBiennium" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "bienniumNumber" INTEGER NOT NULL,
    "periodStartDate" TIMESTAMP(3) NOT NULL,
    "periodEndDate" TIMESTAMP(3),
    "recognizedServiceDays" INTEGER NOT NULL DEFAULT 0,
    "excludedDays" INTEGER NOT NULL DEFAULT 0,
    "completionDate" TIMESTAMP(3),
    "effectiveDate" TIMESTAMP(3),
    "experiencePoints" DECIMAL(10,4),
    "recognitionResolution" VARCHAR(60),
    "recognitionDate" TIMESTAMP(3),
    "status" "ApsBienniumStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApsBiennium_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApsExperienceRule" (
    "id" TEXT NOT NULL,
    "administrativeEntityId" TEXT,
    "categoryId" TEXT,
    "bienniumNumber" INTEGER NOT NULL,
    "points" DECIMAL(10,4) NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApsExperienceRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApsTrainingType" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApsTrainingType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApsTrainingTechnicalLevel" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "factor" DECIMAL(6,4) NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApsTrainingTechnicalLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApsTrainingEvaluationLevel" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "minimumGrade" DECIMAL(5,2) NOT NULL,
    "maximumGrade" DECIMAL(5,2) NOT NULL,
    "factor" DECIMAL(6,4) NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApsTrainingEvaluationLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApsTrainingDurationRule" (
    "id" TEXT NOT NULL,
    "minimumHours" INTEGER NOT NULL,
    "maximumHours" INTEGER,
    "points" DECIMAL(10,4) NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApsTrainingDurationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApsTrainingActivity" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(40) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "trainingTypeId" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "description" VARCHAR(500),
    "pedagogicalHours" INTEGER NOT NULL,
    "technicalLevelId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "includedInMunicipalProgram" BOOLEAN NOT NULL DEFAULT false,
    "minsalRecognized" BOOLEAN NOT NULL DEFAULT false,
    "minimumAttendance" DECIMAL(5,2),
    "evaluationRequired" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "status" VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    "createdBy" VARCHAR(150),
    "updatedBy" VARCHAR(150),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApsTrainingActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeApsTraining" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "trainingActivityId" TEXT NOT NULL,
    "trainingYearId" TEXT NOT NULL,
    "registrationDate" TIMESTAMP(3) NOT NULL,
    "attendancePercentage" DECIMAL(5,2),
    "finalGrade" DECIMAL(5,2),
    "approved" BOOLEAN,
    "durationPoints" DECIMAL(10,4),
    "evaluationFactor" DECIMAL(6,4),
    "technicalFactor" DECIMAL(6,4),
    "calculatedPoints" DECIMAL(10,4),
    "recognizedPoints" DECIMAL(10,4),
    "recognitionDate" TIMESTAMP(3),
    "recognitionResolution" VARCHAR(60),
    "careerYear" INTEGER NOT NULL,
    "documentId" TEXT,
    "status" "ApsTrainingParticipationStatus" NOT NULL DEFAULT 'REGISTERED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeApsTraining_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApsEmployeeTrainingYear" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "earnedPoints" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "recognizedPoints" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "computablePoints" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "annualLimit" DECIMAL(10,4),
    "careerAccumulatedPoints" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "closed" BOOLEAN NOT NULL DEFAULT false,
    "closingDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApsEmployeeTrainingYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApsMunicipalTrainingProgram" (
    "id" TEXT NOT NULL,
    "administrativeEntityId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "programCode" VARCHAR(40) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "approvalDate" TIMESTAMP(3),
    "resolutionNumber" VARCHAR(60),
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "ApsProgramStatus" NOT NULL DEFAULT 'DRAFT',
    "createdBy" VARCHAR(150),
    "updatedBy" VARCHAR(150),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApsMunicipalTrainingProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApsMunicipalTrainingProgramItem" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "trainingActivityId" TEXT NOT NULL,
    "categoryId" TEXT,
    "targetGroup" VARCHAR(150),
    "plannedSlots" INTEGER,
    "budget" DECIMAL(14,2),
    "priority" INTEGER,

    CONSTRAINT "ApsMunicipalTrainingProgramItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EducationInstitutionType" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(40) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EducationInstitutionType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EducationInstitution" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(40) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "institutionTypeId" TEXT NOT NULL,
    "rut" VARCHAR(12),
    "countryId" TEXT NOT NULL,
    "recognizedByState" BOOLEAN NOT NULL DEFAULT true,
    "recognizedByMinsal" BOOLEAN NOT NULL DEFAULT false,
    "accreditationCode" VARCHAR(60),
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" VARCHAR(150),
    "updatedBy" VARCHAR(150),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EducationInstitution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EducationType" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(40) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "countsForApsCareer" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EducationType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeAcademicBackground" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "educationTypeId" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "programName" VARCHAR(200) NOT NULL,
    "titleName" VARCHAR(200),
    "specialty" VARCHAR(150),
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "graduationDate" TIMESTAMP(3),
    "certificateDate" TIMESTAMP(3),
    "totalHours" INTEGER,
    "semesters" INTEGER,
    "countryId" TEXT,
    "recognizedInChile" BOOLEAN NOT NULL DEFAULT true,
    "recognitionAuthority" VARCHAR(150),
    "documentId" TEXT,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "status" "ApsAcademicStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeAcademicBackground_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApsPostgraduate" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "postgraduateType" VARCHAR(30) NOT NULL,
    "institutionId" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "specialtyId" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "totalHours" INTEGER,
    "certificateDate" TIMESTAMP(3),
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "apsRelated" BOOLEAN NOT NULL DEFAULT false,
    "recognized" BOOLEAN NOT NULL DEFAULT false,
    "recognitionDate" TIMESTAMP(3),
    "documentId" TEXT,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "status" "ApsAcademicStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApsPostgraduate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApsPerformanceEvaluation" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "evaluationPeriodCode" VARCHAR(20) NOT NULL,
    "evaluationStart" TIMESTAMP(3) NOT NULL,
    "evaluationEnd" TIMESTAMP(3) NOT NULL,
    "score" DECIMAL(6,2) NOT NULL,
    "listNumber" INTEGER,
    "qualification" VARCHAR(60),
    "rankingPosition" INTEGER,
    "rankingPercentile" DECIMAL(5,2),
    "evaluationDate" TIMESTAMP(3) NOT NULL,
    "appealed" BOOLEAN NOT NULL DEFAULT false,
    "appealResult" VARCHAR(200),
    "finalScore" DECIMAL(6,2),
    "status" VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApsPerformanceEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApsMeritBand" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "percentage" DECIMAL(6,4) NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApsMeritBand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApsMeritAssignment" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "performanceEvaluationId" TEXT NOT NULL,
    "meritBandId" TEXT NOT NULL,
    "percentage" DECIMAL(6,4) NOT NULL,
    "calculationBase" VARCHAR(30) NOT NULL,
    "amount" DECIMAL(12,2),
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "resolutionNumber" VARCHAR(60),
    "status" VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApsMeritAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApsStaffingPosition" (
    "id" TEXT NOT NULL,
    "administrativeEntityId" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "categoryId" TEXT NOT NULL,
    "cargoId" TEXT NOT NULL,
    "plannedHours" INTEGER NOT NULL,
    "authorizedHours" INTEGER NOT NULL,
    "occupiedHours" INTEGER NOT NULL DEFAULT 0,
    "availableHours" INTEGER NOT NULL DEFAULT 0,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApsStaffingPosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApsEmployeeAssignment" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "staffingPositionId" TEXT,
    "categoryId" TEXT NOT NULL,
    "careerLevel" INTEGER NOT NULL,
    "cargoId" TEXT NOT NULL,
    "weeklyHours" INTEGER NOT NULL,
    "contractType" VARCHAR(30) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "status" VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApsEmployeeAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApsWorkSchedule" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "weeklyHours" INTEGER NOT NULL,
    "fullTimeHours" INTEGER NOT NULL,
    "percentage" DECIMAL(6,4) NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApsWorkSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApsResponsibilityType" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(40) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "maxPercentage" DECIMAL(6,4),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApsResponsibilityType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApsResponsibilityAssignment" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "responsibilityTypeId" TEXT NOT NULL,
    "cargoId" TEXT,
    "percentage" DECIMAL(6,4) NOT NULL,
    "calculationBase" VARCHAR(30) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "resolutionNumber" VARCHAR(60),
    "approvalDate" TIMESTAMP(3),
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "status" VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApsResponsibilityAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApsDifficultPerformanceFacility" (
    "id" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "classificationType" VARCHAR(40) NOT NULL,
    "difficultyBand" VARCHAR(20) NOT NULL,
    "percentage" DECIMAL(6,4) NOT NULL,
    "decreeNumber" VARCHAR(60),
    "decreeDate" TIMESTAMP(3),
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApsDifficultPerformanceFacility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApsEmployeeDifficultPerformance" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "facilityClassificationId" TEXT NOT NULL,
    "percentage" DECIMAL(6,4) NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApsEmployeeDifficultPerformance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApsZoneAssignment" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "communeId" TEXT,
    "percentage" DECIMAL(6,4) NOT NULL,
    "legalReference" VARCHAR(200),
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApsZoneAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeApsZoneAssignment" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "zoneAssignmentId" TEXT NOT NULL,
    "facilityId" TEXT,
    "percentage" DECIMAL(6,4) NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeApsZoneAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApsSpecialTemporaryAssignment" (
    "id" TEXT NOT NULL,
    "administrativeEntityId" TEXT NOT NULL,
    "code" VARCHAR(40) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" VARCHAR(500),
    "categoryId" TEXT,
    "careerLevel" INTEGER,
    "percentage" DECIMAL(6,4),
    "fixedAmount" DECIMAL(12,2),
    "calculationBase" VARCHAR(30),
    "budgetYear" INTEGER NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3) NOT NULL,
    "municipalCouncilApproval" BOOLEAN NOT NULL DEFAULT false,
    "resolutionNumber" VARCHAR(60),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" VARCHAR(150),
    "updatedBy" VARCHAR(150),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApsSpecialTemporaryAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApsContractProfile" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "careerLevel" INTEGER NOT NULL,
    "facilityId" TEXT NOT NULL,
    "weeklyHours" INTEGER NOT NULL,
    "baseSalaryAmount" DECIMAL(12,2) NOT NULL,
    "primaryCareAssignmentAmount" DECIMAL(12,2),
    "zonePercentage" DECIMAL(6,4),
    "zoneAmount" DECIMAL(12,2),
    "difficultPerformancePercentage" DECIMAL(6,4),
    "difficultPerformanceAmount" DECIMAL(12,2),
    "responsibilityPercentage" DECIMAL(6,4),
    "responsibilityAmount" DECIMAL(12,2),
    "meritPercentage" DECIMAL(6,4),
    "meritAmount" DECIMAL(12,2),
    "specialAssignmentAmount" DECIMAL(12,2),
    "postgraduateAssignmentAmount" DECIMAL(12,2),
    "totalApsAssignments" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    "createdBy" VARCHAR(150),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApsContractProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApsAdministrativeEntityProfile_legalEntityId_key" ON "ApsAdministrativeEntityProfile"("legalEntityId");

-- CreateIndex
CREATE UNIQUE INDEX "ApsHealthService_code_key" ON "ApsHealthService"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ApsFacilityType_code_key" ON "ApsFacilityType"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ApsHealthFacility_code_key" ON "ApsHealthFacility"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ApsEmployeeCategory_code_key" ON "ApsEmployeeCategory"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ApsProfession_code_key" ON "ApsProfession"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ApsCareer_employeeId_key" ON "ApsCareer"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "ApsLaborInstitution_code_key" ON "ApsLaborInstitution"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ApsBiennium_employeeId_bienniumNumber_key" ON "ApsBiennium"("employeeId", "bienniumNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ApsTrainingType_code_key" ON "ApsTrainingType"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ApsTrainingTechnicalLevel_code_key" ON "ApsTrainingTechnicalLevel"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ApsTrainingEvaluationLevel_code_key" ON "ApsTrainingEvaluationLevel"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ApsTrainingActivity_code_key" ON "ApsTrainingActivity"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ApsEmployeeTrainingYear_employeeId_year_key" ON "ApsEmployeeTrainingYear"("employeeId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "ApsMunicipalTrainingProgram_programCode_key" ON "ApsMunicipalTrainingProgram"("programCode");

-- CreateIndex
CREATE UNIQUE INDEX "EducationInstitutionType_code_key" ON "EducationInstitutionType"("code");

-- CreateIndex
CREATE UNIQUE INDEX "EducationInstitution_code_key" ON "EducationInstitution"("code");

-- CreateIndex
CREATE UNIQUE INDEX "EducationType_code_key" ON "EducationType"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ApsMeritBand_code_key" ON "ApsMeritBand"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ApsResponsibilityType_code_key" ON "ApsResponsibilityType"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ApsZoneAssignment_code_key" ON "ApsZoneAssignment"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ApsSpecialTemporaryAssignment_code_key" ON "ApsSpecialTemporaryAssignment"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ApsContractProfile_contractId_key" ON "ApsContractProfile"("contractId");

-- AddForeignKey
ALTER TABLE "LegalParameter" ADD CONSTRAINT "LegalParameter_laborRegimeId_fkey" FOREIGN KEY ("laborRegimeId") REFERENCES "LaborRegime"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsAdministrativeEntityProfile" ADD CONSTRAINT "ApsAdministrativeEntityProfile_legalEntityId_fkey" FOREIGN KEY ("legalEntityId") REFERENCES "LegalEntity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsAdministrativeEntityProfile" ADD CONSTRAINT "ApsAdministrativeEntityProfile_municipalityCommuneId_fkey" FOREIGN KEY ("municipalityCommuneId") REFERENCES "Commune"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsAdministrativeEntityProfile" ADD CONSTRAINT "ApsAdministrativeEntityProfile_healthServiceId_fkey" FOREIGN KEY ("healthServiceId") REFERENCES "ApsHealthService"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsAdministrativeEntityProfile" ADD CONSTRAINT "ApsAdministrativeEntityProfile_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsHealthService" ADD CONSTRAINT "ApsHealthService_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsHealthFacility" ADD CONSTRAINT "ApsHealthFacility_administrativeEntityId_fkey" FOREIGN KEY ("administrativeEntityId") REFERENCES "LegalEntity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsHealthFacility" ADD CONSTRAINT "ApsHealthFacility_facilityTypeId_fkey" FOREIGN KEY ("facilityTypeId") REFERENCES "ApsFacilityType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsHealthFacility" ADD CONSTRAINT "ApsHealthFacility_communeId_fkey" FOREIGN KEY ("communeId") REFERENCES "Commune"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsHealthFacility" ADD CONSTRAINT "ApsHealthFacility_healthServiceId_fkey" FOREIGN KEY ("healthServiceId") REFERENCES "ApsHealthService"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsHealthFacility" ADD CONSTRAINT "ApsHealthFacility_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsProfession" ADD CONSTRAINT "ApsProfession_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ApsEmployeeCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsCareerLevel" ADD CONSTRAINT "ApsCareerLevel_administrativeEntityId_fkey" FOREIGN KEY ("administrativeEntityId") REFERENCES "LegalEntity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsCareerLevel" ADD CONSTRAINT "ApsCareerLevel_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ApsEmployeeCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsBaseSalaryScale" ADD CONSTRAINT "ApsBaseSalaryScale_administrativeEntityId_fkey" FOREIGN KEY ("administrativeEntityId") REFERENCES "LegalEntity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsBaseSalaryScale" ADD CONSTRAINT "ApsBaseSalaryScale_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ApsEmployeeCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsNationalMinimumBaseSalary" ADD CONSTRAINT "ApsNationalMinimumBaseSalary_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ApsEmployeeCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsCareer" ADD CONSTRAINT "ApsCareer_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsCareer" ADD CONSTRAINT "ApsCareer_administrativeEntityId_fkey" FOREIGN KEY ("administrativeEntityId") REFERENCES "LegalEntity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsCareer" ADD CONSTRAINT "ApsCareer_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ApsEmployeeCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsCareerHistory" ADD CONSTRAINT "ApsCareerHistory_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsCareerHistory" ADD CONSTRAINT "ApsCareerHistory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ApsEmployeeCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsCareerHistory" ADD CONSTRAINT "ApsCareerHistory_employeeEventId_fkey" FOREIGN KEY ("employeeEventId") REFERENCES "EmployeeEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsRecognizedService" ADD CONSTRAINT "ApsRecognizedService_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsRecognizedService" ADD CONSTRAINT "ApsRecognizedService_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "ApsLaborInstitution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsRecognizedService" ADD CONSTRAINT "ApsRecognizedService_bienniumId_fkey" FOREIGN KEY ("bienniumId") REFERENCES "ApsBiennium"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsServiceExclusion" ADD CONSTRAINT "ApsServiceExclusion_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsServiceExclusion" ADD CONSTRAINT "ApsServiceExclusion_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "ApsRecognizedService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsBiennium" ADD CONSTRAINT "ApsBiennium_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsExperienceRule" ADD CONSTRAINT "ApsExperienceRule_administrativeEntityId_fkey" FOREIGN KEY ("administrativeEntityId") REFERENCES "LegalEntity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsExperienceRule" ADD CONSTRAINT "ApsExperienceRule_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ApsEmployeeCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsTrainingActivity" ADD CONSTRAINT "ApsTrainingActivity_trainingTypeId_fkey" FOREIGN KEY ("trainingTypeId") REFERENCES "ApsTrainingType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsTrainingActivity" ADD CONSTRAINT "ApsTrainingActivity_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "EducationInstitution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsTrainingActivity" ADD CONSTRAINT "ApsTrainingActivity_technicalLevelId_fkey" FOREIGN KEY ("technicalLevelId") REFERENCES "ApsTrainingTechnicalLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeApsTraining" ADD CONSTRAINT "EmployeeApsTraining_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeApsTraining" ADD CONSTRAINT "EmployeeApsTraining_trainingActivityId_fkey" FOREIGN KEY ("trainingActivityId") REFERENCES "ApsTrainingActivity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeApsTraining" ADD CONSTRAINT "EmployeeApsTraining_trainingYearId_fkey" FOREIGN KEY ("trainingYearId") REFERENCES "ApsEmployeeTrainingYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsEmployeeTrainingYear" ADD CONSTRAINT "ApsEmployeeTrainingYear_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsMunicipalTrainingProgram" ADD CONSTRAINT "ApsMunicipalTrainingProgram_administrativeEntityId_fkey" FOREIGN KEY ("administrativeEntityId") REFERENCES "LegalEntity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsMunicipalTrainingProgramItem" ADD CONSTRAINT "ApsMunicipalTrainingProgramItem_programId_fkey" FOREIGN KEY ("programId") REFERENCES "ApsMunicipalTrainingProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsMunicipalTrainingProgramItem" ADD CONSTRAINT "ApsMunicipalTrainingProgramItem_trainingActivityId_fkey" FOREIGN KEY ("trainingActivityId") REFERENCES "ApsTrainingActivity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsMunicipalTrainingProgramItem" ADD CONSTRAINT "ApsMunicipalTrainingProgramItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ApsEmployeeCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EducationInstitution" ADD CONSTRAINT "EducationInstitution_institutionTypeId_fkey" FOREIGN KEY ("institutionTypeId") REFERENCES "EducationInstitutionType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EducationInstitution" ADD CONSTRAINT "EducationInstitution_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeAcademicBackground" ADD CONSTRAINT "EmployeeAcademicBackground_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeAcademicBackground" ADD CONSTRAINT "EmployeeAcademicBackground_educationTypeId_fkey" FOREIGN KEY ("educationTypeId") REFERENCES "EducationType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeAcademicBackground" ADD CONSTRAINT "EmployeeAcademicBackground_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "EducationInstitution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeAcademicBackground" ADD CONSTRAINT "EmployeeAcademicBackground_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsPostgraduate" ADD CONSTRAINT "ApsPostgraduate_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsPostgraduate" ADD CONSTRAINT "ApsPostgraduate_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "EducationInstitution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsPostgraduate" ADD CONSTRAINT "ApsPostgraduate_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "ApsProfession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsPerformanceEvaluation" ADD CONSTRAINT "ApsPerformanceEvaluation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsMeritAssignment" ADD CONSTRAINT "ApsMeritAssignment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsMeritAssignment" ADD CONSTRAINT "ApsMeritAssignment_performanceEvaluationId_fkey" FOREIGN KEY ("performanceEvaluationId") REFERENCES "ApsPerformanceEvaluation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsMeritAssignment" ADD CONSTRAINT "ApsMeritAssignment_meritBandId_fkey" FOREIGN KEY ("meritBandId") REFERENCES "ApsMeritBand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsStaffingPosition" ADD CONSTRAINT "ApsStaffingPosition_administrativeEntityId_fkey" FOREIGN KEY ("administrativeEntityId") REFERENCES "LegalEntity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsStaffingPosition" ADD CONSTRAINT "ApsStaffingPosition_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "ApsHealthFacility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsStaffingPosition" ADD CONSTRAINT "ApsStaffingPosition_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ApsEmployeeCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsStaffingPosition" ADD CONSTRAINT "ApsStaffingPosition_cargoId_fkey" FOREIGN KEY ("cargoId") REFERENCES "Cargo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsEmployeeAssignment" ADD CONSTRAINT "ApsEmployeeAssignment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsEmployeeAssignment" ADD CONSTRAINT "ApsEmployeeAssignment_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "ApsHealthFacility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsEmployeeAssignment" ADD CONSTRAINT "ApsEmployeeAssignment_staffingPositionId_fkey" FOREIGN KEY ("staffingPositionId") REFERENCES "ApsStaffingPosition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsEmployeeAssignment" ADD CONSTRAINT "ApsEmployeeAssignment_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ApsEmployeeCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsEmployeeAssignment" ADD CONSTRAINT "ApsEmployeeAssignment_cargoId_fkey" FOREIGN KEY ("cargoId") REFERENCES "Cargo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsWorkSchedule" ADD CONSTRAINT "ApsWorkSchedule_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsResponsibilityAssignment" ADD CONSTRAINT "ApsResponsibilityAssignment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsResponsibilityAssignment" ADD CONSTRAINT "ApsResponsibilityAssignment_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "ApsHealthFacility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsResponsibilityAssignment" ADD CONSTRAINT "ApsResponsibilityAssignment_responsibilityTypeId_fkey" FOREIGN KEY ("responsibilityTypeId") REFERENCES "ApsResponsibilityType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsResponsibilityAssignment" ADD CONSTRAINT "ApsResponsibilityAssignment_cargoId_fkey" FOREIGN KEY ("cargoId") REFERENCES "Cargo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsDifficultPerformanceFacility" ADD CONSTRAINT "ApsDifficultPerformanceFacility_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "ApsHealthFacility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsEmployeeDifficultPerformance" ADD CONSTRAINT "ApsEmployeeDifficultPerformance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsEmployeeDifficultPerformance" ADD CONSTRAINT "ApsEmployeeDifficultPerformance_facilityClassificationId_fkey" FOREIGN KEY ("facilityClassificationId") REFERENCES "ApsDifficultPerformanceFacility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsZoneAssignment" ADD CONSTRAINT "ApsZoneAssignment_communeId_fkey" FOREIGN KEY ("communeId") REFERENCES "Commune"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeApsZoneAssignment" ADD CONSTRAINT "EmployeeApsZoneAssignment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeApsZoneAssignment" ADD CONSTRAINT "EmployeeApsZoneAssignment_zoneAssignmentId_fkey" FOREIGN KEY ("zoneAssignmentId") REFERENCES "ApsZoneAssignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeApsZoneAssignment" ADD CONSTRAINT "EmployeeApsZoneAssignment_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "ApsHealthFacility"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsSpecialTemporaryAssignment" ADD CONSTRAINT "ApsSpecialTemporaryAssignment_administrativeEntityId_fkey" FOREIGN KEY ("administrativeEntityId") REFERENCES "LegalEntity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsSpecialTemporaryAssignment" ADD CONSTRAINT "ApsSpecialTemporaryAssignment_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ApsEmployeeCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsContractProfile" ADD CONSTRAINT "ApsContractProfile_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsContractProfile" ADD CONSTRAINT "ApsContractProfile_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ApsEmployeeCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApsContractProfile" ADD CONSTRAINT "ApsContractProfile_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "ApsHealthFacility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
