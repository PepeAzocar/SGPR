import { Type } from 'class-transformer';
import { IsDate, IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateApsTrainingDurationRuleDto {
  @IsInt()
  @Min(0)
  minimumHours: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maximumHours?: number; // vacío = sin techo (tramo "80+")

  @IsNumber()
  points: number;

  @IsDate()
  @Type(() => Date)
  effectiveFrom: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  effectiveTo?: Date;
}
