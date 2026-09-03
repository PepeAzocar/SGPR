import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateApsLaborInstitutionDto {
  @IsString()
  @MaxLength(30)
  code: string;

  @IsString()
  @MaxLength(200)
  name: string;

  @IsString()
  @MaxLength(40)
  institutionType: string; // MUNICIPALITY / HEALTH_SERVICE / MUNICIPAL_CORPORATION / PUBLIC_SERVICE / PRIVATE / OTHER

  @IsOptional()
  @IsBoolean()
  aps?: boolean;

  @IsOptional()
  @IsBoolean()
  publicSector?: boolean;

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
