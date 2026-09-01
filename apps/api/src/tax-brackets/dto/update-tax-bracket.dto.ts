import { PartialType } from '@nestjs/mapped-types';
import { CreateTaxBracketDto } from './create-tax-bracket.dto.js';

export class UpdateTaxBracketDto extends PartialType(CreateTaxBracketDto) {}
