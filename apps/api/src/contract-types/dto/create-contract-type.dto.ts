import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateContractTypeDto {
  @IsString()
  @MaxLength(30)
  code: string;

  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  laborRegimeId: string;

  @IsOptional()
  @IsBoolean()
  requiresEndDate?: boolean;

  @IsOptional()
  @IsBoolean()
  allowsExtension?: boolean;

  @IsOptional()
  @IsBoolean()
  allowsIndefiniteConversion?: boolean;

  @IsOptional()
  @IsBoolean()
  payrollRelevant?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  effectiveFrom?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  effectiveTo?: Date;
}
