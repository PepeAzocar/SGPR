import { IsDate, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEconomicIndicatorDto {
  @IsDate()
  @Type(() => Date)
  period: Date;

  @IsNumber()
  @Min(0)
  ufValue: number;

  @IsNumber()
  @Min(0)
  utmValue: number;

  @IsNumber()
  @Min(0)
  minWage: number;

  @IsNumber()
  @Min(0)
  afpHealthCapUf: number;
}
