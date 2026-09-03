import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsIn, IsInt, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

const STATUSES = ['REGISTERED', 'IN_PROGRESS', 'APPROVED', 'FAILED', 'RECOGNIZED', 'REJECTED'] as const;

// Detalle anidado bajo ApsEmployeeTrainingYear — employeeId y trainingYearId
// los completa el service a partir del maestro (:id de la ruta), no van en el body.
export class CreateEmployeeApsTrainingDto {
  @IsString()
  trainingActivityId: string;

  @IsDate()
  @Type(() => Date)
  registrationDate: Date;

  @IsOptional()
  @IsNumber()
  attendancePercentage?: number;

  @IsOptional()
  @IsNumber()
  finalGrade?: number;

  @IsOptional()
  @IsBoolean()
  approved?: boolean;

  @IsOptional()
  @IsNumber()
  durationPoints?: number;

  @IsOptional()
  @IsNumber()
  evaluationFactor?: number;

  @IsOptional()
  @IsNumber()
  technicalFactor?: number;

  @IsOptional()
  @IsNumber()
  calculatedPoints?: number;

  @IsOptional()
  @IsNumber()
  recognizedPoints?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  recognitionDate?: Date;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  recognitionResolution?: string;

  @IsInt()
  careerYear: number;

  @IsOptional()
  @IsString()
  documentId?: string;

  @IsOptional()
  @IsIn(STATUSES)
  status?: (typeof STATUSES)[number];
}
