import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsIn, IsInt, IsNumber, IsOptional, IsString, Min, MaxLength } from 'class-validator';

const STATUSES = ['DRAFT', 'ACTIVE', 'INACTIVE'] as const;

export class CreateApsTrainingActivityDto {
  @IsString()
  @MaxLength(40)
  code: string;

  @IsString()
  @MaxLength(200)
  name: string;

  @IsString()
  trainingTypeId: string;

  @IsString()
  institutionId: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsInt()
  @Min(1)
  pedagogicalHours: number;

  @IsString()
  technicalLevelId: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @IsOptional()
  @IsBoolean()
  includedInMunicipalProgram?: boolean;

  @IsOptional()
  @IsBoolean()
  minsalRecognized?: boolean;

  @IsOptional()
  @IsNumber()
  minimumAttendance?: number;

  @IsOptional()
  @IsBoolean()
  evaluationRequired?: boolean;

  @IsDate()
  @Type(() => Date)
  effectiveFrom: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  effectiveTo?: Date;

  @IsOptional()
  @IsIn(STATUSES)
  status?: (typeof STATUSES)[number];
}
