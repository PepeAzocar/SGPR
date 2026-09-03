import { IsIn, IsString, MaxLength } from 'class-validator';
import { DOCUMENT_TYPES } from './create-contract-matrix.dto.js';

export class CreateContractTemplateDto {
  @IsString()
  @MaxLength(80)
  code: string;

  @IsString()
  @MaxLength(200)
  name: string;

  @IsIn(DOCUMENT_TYPES)
  documentType: (typeof DOCUMENT_TYPES)[number];
}
