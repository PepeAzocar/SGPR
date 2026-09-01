import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AffiliationStatus } from '../../generated/prisma/enums.js';

export class CreateEmployeeAfpDto {
  @IsString()
  employeeId: string;

  @IsString()
  afpId: string;

  @IsDate()
  @Type(() => Date)
  affiliationDate: Date; // fecha_afiliacion_sistema

  @IsDate()
  @Type(() => Date)
  afpJoinDate: Date; // fecha_incorporacion_afp

  @IsDate()
  @Type(() => Date)
  effectiveFrom: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  effectiveTo?: Date;

  @IsOptional()
  @IsEnum(AffiliationStatus)
  status?: AffiliationStatus;

  @IsOptional()
  @IsString()
  @MaxLength(1)
  fundType?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  mandatoryContributionPct: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  afpCommissionPct?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  additionalContributionPct?: number;

  @IsBoolean()
  heavyWork: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  heavyWorkPct?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
