import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsEnum, IsInt, IsOptional, IsString, Min, MaxLength } from 'class-validator';
import { ApsServiceExclusionType } from '../../generated/prisma/enums.js';

// Detalle anidado bajo ApsRecognizedService — employeeId lo completa el
// service a partir del servicio padre.
export class CreateApsServiceExclusionDto {
  @IsEnum(ApsServiceExclusionType)
  exclusionType: ApsServiceExclusionType;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @IsInt()
  @Min(0)
  days: number;

  @IsOptional()
  @IsBoolean()
  affectsBiennium?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  reason?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  legalReference?: string;

  @IsOptional()
  @IsString()
  documentId?: string;
}
