import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateApsEmployeeTrainingYearDto {
  @IsString()
  employeeId: string;

  @IsInt()
  @Min(2000)
  year: number;

  @IsOptional()
  @IsNumber()
  annualLimit?: number;
}
