import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateClauseDto {
  @IsString()
  @MaxLength(80)
  code: string;

  @IsString()
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
