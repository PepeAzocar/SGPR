import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateApsTrainingTechnicalLevelDto {
  @IsString()
  @MaxLength(20)
  code: string; // LOW / MEDIUM / HIGH

  @IsString()
  @MaxLength(100)
  name: string;

  @IsNumber()
  factor: number; // 1.0 / 1.1 / 1.2 según reglamento

  @IsDate()
  @Type(() => Date)
  effectiveFrom: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  effectiveTo?: Date;
}
