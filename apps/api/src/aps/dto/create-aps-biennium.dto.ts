import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApsBienniumStatus } from '../../generated/prisma/enums.js';

export class CreateApsBienniumDto {
  @IsString()
  employeeId: string;

  @IsInt()
  @Min(1)
  @Max(15) // tope legal de bienios computables
  bienniumNumber: number;

  @IsDate()
  @Type(() => Date)
  periodStartDate: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  periodEndDate?: Date;

  @IsOptional()
  @IsEnum(ApsBienniumStatus)
  status?: ApsBienniumStatus;
}
