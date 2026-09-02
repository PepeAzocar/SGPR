import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PayrollVariableSource } from '../../generated/prisma/enums.js';

export class CreatePayrollVariableDto {
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

  @IsEnum(PayrollVariableSource)
  source: PayrollVariableSource;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
