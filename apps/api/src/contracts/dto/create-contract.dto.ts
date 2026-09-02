import {
  IsBoolean,
  IsDate,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateContractDto {
  @IsString()
  employeeId: string;

  @IsString()
  positionId: string;

  @IsString()
  legalEntityId: string;

  @IsString()
  laborRegimeId: string;

  @IsString()
  contractTypeId: string;

  @IsString()
  @MaxLength(30)
  contractNumber: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  sequenceNumber?: number;

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
