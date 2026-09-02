import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateEmployeeEventChangeDto {
  @IsString()
  @MaxLength(40)
  fieldCode: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  oldValue?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  newValue?: string;

  @IsOptional()
  @IsString()
  oldReferenceId?: string;

  @IsOptional()
  @IsString()
  newReferenceId?: string;
}
