import { PartialType } from '@nestjs/mapped-types';
import { CreateEducationInstitutionTypeDto } from './create-education-institution-type.dto.js';

export class UpdateEducationInstitutionTypeDto extends PartialType(CreateEducationInstitutionTypeDto) {}
