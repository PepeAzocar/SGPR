import { PartialType } from '@nestjs/mapped-types';
import { CreateEducationInstitutionDto } from './create-education-institution.dto.js';

export class UpdateEducationInstitutionDto extends PartialType(CreateEducationInstitutionDto) {}
