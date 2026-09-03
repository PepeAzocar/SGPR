import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateEducationTypeDto {
  @IsString()
  @MaxLength(40)
  code: string;

  @IsString()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsBoolean()
  countsForApsCareer?: boolean; // formación académica != capacitación válida para puntaje

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
