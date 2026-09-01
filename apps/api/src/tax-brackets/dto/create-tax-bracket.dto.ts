import { IsDate, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTaxBracketDto {
  @IsDate()
  @Type(() => Date)
  validFrom: Date;

  @IsNumber()
  @Min(0)
  fromUtm: number;

  @IsOptional()
  @IsNumber()
  toUtm?: number;

  @IsNumber()
  factor: number;

  @IsNumber()
  deductionUtm: number;
}
