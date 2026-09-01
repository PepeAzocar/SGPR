import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateAfpEntityDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  workerRate: number;

  @IsOptional()
  isActive?: boolean;
}
