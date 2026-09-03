import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateEducationInstitutionDto {
  @IsString()
  @MaxLength(40)
  code: string;

  @IsString()
  @MaxLength(200)
  name: string;

  @IsString()
  institutionTypeId: string;

  @IsOptional()
  @IsString()
  @MaxLength(12)
  rut?: string;

  @IsString()
  countryId: string;

  @IsOptional()
  @IsBoolean()
  recognizedByState?: boolean;

  @IsOptional()
  @IsBoolean()
  recognizedByMinsal?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  accreditationCode?: string;

  @IsDate()
  @Type(() => Date)
  effectiveFrom: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  effectiveTo?: Date;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
