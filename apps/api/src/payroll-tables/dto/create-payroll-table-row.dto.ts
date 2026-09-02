import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional } from 'class-validator';

export class CreatePayrollTableRowDto {
  @IsNumber()
  fromValue: number;

  @IsOptional()
  @IsNumber()
  toValue?: number;

  @IsNumber()
  resultValue: number;

  @IsDate()
  @Type(() => Date)
  effectiveFrom: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  effectiveTo?: Date;
}
