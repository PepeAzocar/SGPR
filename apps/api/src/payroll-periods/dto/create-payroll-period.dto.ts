import { Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional, Max, Min } from 'class-validator';

export class CreatePayrollPeriodDto {
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsInt()
  @Min(2000)
  year: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  paymentDate?: Date;
}
