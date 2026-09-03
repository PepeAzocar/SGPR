import { PartialType } from '@nestjs/mapped-types';
import { CreateDocumentTokenDto } from './create-document-token.dto.js';

export class UpdateDocumentTokenDto extends PartialType(CreateDocumentTokenDto) {}
