import { IsString, MaxLength } from 'class-validator';

export class CreatePositionDto {
  @IsString()
  @MaxLength(150)
  title: string;

  @IsString()
  departmentId: string;
}
