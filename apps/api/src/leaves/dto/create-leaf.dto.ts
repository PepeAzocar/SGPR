import { IsDate, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { LeaveStatus, LeaveType } from '../../generated/prisma/enums.js';

export class CreateLeafDto {
  @IsString()
  employeeId: string;

  @IsEnum(LeaveType)
  type: LeaveType;

  @IsOptional()
  @IsEnum(LeaveStatus)
  status?: LeaveStatus;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @IsInt()
  @Min(1)
  days: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
