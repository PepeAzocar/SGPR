import { IsBoolean, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export const TOKEN_DATA_TYPES = ['STRING', 'DATE', 'DECIMAL', 'BOOLEAN'] as const;

export class CreateDocumentTokenDto {
  @IsString()
  @MaxLength(100)
  code: string;

  @IsString()
  @MaxLength(50)
  namespace: string;

  @IsString()
  @MaxLength(150)
  name: string;

  @IsIn(TOKEN_DATA_TYPES)
  dataType: (typeof TOKEN_DATA_TYPES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  sourceEntity?: string;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsBoolean()
  sensitive?: boolean;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
