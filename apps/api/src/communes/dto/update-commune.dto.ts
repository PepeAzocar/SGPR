import { PartialType } from '@nestjs/mapped-types';
import { CreateCommuneDto } from './create-commune.dto.js';

export class UpdateCommuneDto extends PartialType(CreateCommuneDto) {}
