import { Type } from 'class-transformer';
import { IsDate, IsNumber } from 'class-validator';

export class AddPayrollParameterValueDto {
  @IsNumber()
  value: number;

  @IsDate()
  @Type(() => Date)
  effectiveFrom: Date;
}
