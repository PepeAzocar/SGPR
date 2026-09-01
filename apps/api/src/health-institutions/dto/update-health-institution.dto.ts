import { PartialType } from '@nestjs/mapped-types';
import { CreateHealthInstitutionDto } from './create-health-institution.dto.js';

export class UpdateHealthInstitutionDto extends PartialType(CreateHealthInstitutionDto) {}
