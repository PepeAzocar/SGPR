import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { ConceptCategory, ConceptType } from '../../generated/prisma/enums.js';

export class CreatePayrollConceptDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsEnum(ConceptType)
  type: ConceptType;

  @IsEnum(ConceptCategory)
  category: ConceptCategory;

  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;
}
