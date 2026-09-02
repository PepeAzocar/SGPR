import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePayrollParameterDto {
  @IsString()
  @MaxLength(50)
  code: string;

  @IsString()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
