import { IsDate, IsEnum, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AffiliationStatus } from '../../generated/prisma/enums.js';

export class CreateHealthAffiliationDto {
  @IsString()
  employeeId: string;

  @IsString()
  healthInstitutionId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  planUfValue?: number;

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
  @MaxLength(500)
  notes?: string;
}
