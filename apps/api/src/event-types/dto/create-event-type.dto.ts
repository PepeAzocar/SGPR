import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateEventTypeDto {
  @IsString()
  @MaxLength(40)
  code: string;

  @IsString()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsBoolean()
  payrollRelevant?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
