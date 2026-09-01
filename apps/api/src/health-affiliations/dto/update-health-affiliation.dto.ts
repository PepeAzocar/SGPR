import { PartialType } from '@nestjs/mapped-types';
import { CreateHealthAffiliationDto } from './create-health-affiliation.dto.js';

export class UpdateHealthAffiliationDto extends PartialType(CreateHealthAffiliationDto) {}
