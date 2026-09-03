import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateMatrixClauseDto {
  @IsString()
  clauseId: string;

  @IsInt()
  @Min(0)
  sequence: number;

  @IsOptional()
  @IsBoolean()
  mandatory?: boolean;
}
