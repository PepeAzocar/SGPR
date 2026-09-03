import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApsUrbanRural } from '../../generated/prisma/enums.js';

export class CreateApsHealthFacilityDto {
  @IsString()
  administrativeEntityId: string;

  @IsString()
  @MaxLength(30)
  code: string;

  @IsString()
  @MaxLength(200)
  name: string;

  @IsString()
  facilityTypeId: string;

  @IsEnum(ApsUrbanRural)
  urbanRural: ApsUrbanRural;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  address?: string;

  @IsString()
  communeId: string;

  @IsOptional()
  @IsString()
  healthServiceId?: string;

  @IsOptional()
  @IsString()
  divisionId?: string;

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
