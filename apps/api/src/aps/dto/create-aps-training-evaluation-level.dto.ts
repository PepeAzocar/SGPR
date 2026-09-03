import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateApsTrainingEvaluationLevelDto {
  @IsString()
  @MaxLength(20)
  code: string; // MINIMUM / MEDIUM / MAXIMUM

  @IsString()
  @MaxLength(100)
  name: string;

  @IsNumber()
  minimumGrade: number;

  @IsNumber()
  maximumGrade: number;

  @IsNumber()
  factor: number; // 0.4 a 1.0 según reglamento

  @IsDate()
  @Type(() => Date)
  effectiveFrom: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  effectiveTo?: Date;
}
