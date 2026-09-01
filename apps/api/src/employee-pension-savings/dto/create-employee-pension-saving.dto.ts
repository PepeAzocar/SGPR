import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ContributionMode,
  PensionProductType,
  PensionSavingStatus,
} from '../../generated/prisma/enums.js';

export class CreateEmployeePensionSavingDto {
  @IsString()
  employeeId: string;

  @IsEnum(PensionProductType)
  productType: PensionProductType;

  @IsString()
  institutionId: string;

  @IsOptional()
  @IsString()
  @MaxLength(1)
  taxRegime?: string; // A/B, solo APV

  @IsEnum(ContributionMode)
  contributionMode: ContributionMode;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  percentage?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1)
  fundType?: string;

  @IsDate()
  @Type(() => Date)
  effectiveFrom: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  effectiveTo?: Date;

  @IsOptional()
  @IsEnum(PensionSavingStatus)
  status?: PensionSavingStatus;

  @IsOptional()
  @IsBoolean()
  payrollDeduction?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  contractNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
