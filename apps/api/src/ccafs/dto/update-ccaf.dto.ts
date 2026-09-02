import { PartialType } from '@nestjs/mapped-types';
import { CreateCcafDto } from './create-ccaf.dto.js';

export class UpdateCcafDto extends PartialType(CreateCcafDto) {}
