import { Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreatePayrollFormulaDto {
  @IsString()
  conceptId: string;

  @IsString()
  @MaxLength(2000)
  formulaExpression: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  condition?: string;

  @IsOptional()
  @IsString()
  laborRegimeId?: string;

  @IsOptional()
  @IsString()
  legalEntityId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: number;

  @IsDate()
  @Type(() => Date)
  effectiveFrom: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  effectiveTo?: Date;
}
