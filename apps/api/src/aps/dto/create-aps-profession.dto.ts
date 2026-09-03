import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsInt, IsOptional, IsString, Min, MaxLength } from 'class-validator';

export class CreateApsProfessionDto {
  @IsString()
  @MaxLength(40)
  code: string;

  @IsString()
  @MaxLength(150)
  name: string;

  @IsString()
  categoryId: string;

  @IsOptional()
  @IsBoolean()
  professionalTitleRequired?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  minimumSemesters?: number;

  @IsOptional()
  @IsBoolean()
  healthRegistryRequired?: boolean;

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
