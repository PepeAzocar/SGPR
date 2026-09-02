import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class EvaluateFormulaDto {
  @IsString()
  @MaxLength(2000)
  formulaExpression: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  condition?: string;

  @IsObject()
  variables: Record<string, number>;
}
