import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePayrollTableDto {
  @IsString()
  @MaxLength(50)
  code: string;

  @IsString()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
