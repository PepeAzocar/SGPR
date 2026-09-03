import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApsBienniumStatus } from '../../generated/prisma/enums.js';

export class UpdateApsBienniumDto {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  periodEndDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  completionDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  effectiveDate?: Date;

  @IsOptional()
  @IsNumber()
  experiencePoints?: number;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  recognitionResolution?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  recognitionDate?: Date;

  @IsOptional()
  @IsEnum(ApsBienniumStatus)
  status?: ApsBienniumStatus;
}
