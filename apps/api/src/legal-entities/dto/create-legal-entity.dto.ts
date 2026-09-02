import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { OrgUnitStatus } from '../../generated/prisma/enums.js';

export class CreateLegalEntityDto {
  @IsString()
  @MaxLength(50)
  code: string;

  @IsString()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsDateString()
  effectiveFrom: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @IsOptional()
  @IsEnum(OrgUnitStatus)
  status?: OrgUnitStatus;
}
