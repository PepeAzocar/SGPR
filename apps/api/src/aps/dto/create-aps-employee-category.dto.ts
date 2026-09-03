import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsInt, IsOptional, IsString, Min, MaxLength } from 'class-validator';

export class CreateApsEmployeeCategoryDto {
  @IsString()
  @MaxLength(5)
  code: string; // "A".."F"

  @IsString()
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  qualificationLevel?: string;

  @IsOptional()
  @IsBoolean()
  professionalRequired?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  minimumSemesters?: number;

  @IsDate()
  @Type(() => Date)
  effectiveFrom: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  effectiveTo?: Date;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
