import { PartialType } from '@nestjs/mapped-types';
import { CreateApsLaborInstitutionDto } from './create-aps-labor-institution.dto.js';

export class UpdateApsLaborInstitutionDto extends PartialType(CreateApsLaborInstitutionDto) {}
