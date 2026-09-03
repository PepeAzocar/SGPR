import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateEducationInstitutionTypeDto {
  @IsString()
  @MaxLength(40)
  code: string;

  @IsString()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
