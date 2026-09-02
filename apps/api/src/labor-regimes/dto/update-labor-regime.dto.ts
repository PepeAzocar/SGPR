import { PartialType } from '@nestjs/mapped-types';
import { CreateLaborRegimeDto } from './create-labor-regime.dto.js';

export class UpdateLaborRegimeDto extends PartialType(CreateLaborRegimeDto) {}
