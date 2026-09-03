import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsNumber, IsOptional } from 'class-validator';

export class UpdateApsEmployeeTrainingYearDto {
  @IsOptional()
  @IsNumber()
  annualLimit?: number;

  @IsOptional()
  @IsNumber()
  earnedPoints?: number;

  @IsOptional()
  @IsNumber()
  recognizedPoints?: number;

  @IsOptional()
  @IsNumber()
  computablePoints?: number;

  @IsOptional()
  @IsNumber()
  careerAccumulatedPoints?: number;

  @IsOptional()
  @IsBoolean()
  closed?: boolean;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  closingDate?: Date;
}
