import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ContractType } from '../../generated/prisma/enums.js';

export class CreateContractDto {
  @IsString()
  employeeId: string;

  @IsString()
  positionId: string;

  @IsEnum(ContractType)
  type: ContractType;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @IsNumber()
  @Min(0)
  baseSalary: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  weeklyHours?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
