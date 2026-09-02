import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { HealthInstitutionType } from '../../generated/prisma/enums.js';

export class CreateHealthInstitutionDto {
  @IsString()
  name: string;

  @IsEnum(HealthInstitutionType)
  type: HealthInstitutionType;

  @IsOptional()
  isActive?: boolean;

  @IsDate()
  @Type(() => Date)
  effectiveFrom: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  effectiveTo?: Date;
}
