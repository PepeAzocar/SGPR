import { Type } from 'class-transformer';
import { IsArray, IsDate, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { CreateEmployeeEventChangeDto } from './create-employee-event-change.dto.js';

export class CreateEmployeeEventDto {
  @IsString()
  employeeId: string;

  @IsDate()
  @Type(() => Date)
  effectiveDate: Date;

  @IsString()
  eventTypeId: string;

  @IsString()
  eventReasonId: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  documentReference?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEmployeeEventChangeDto)
  changes?: CreateEmployeeEventChangeDto[];
}
