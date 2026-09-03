import { PartialType } from '@nestjs/mapped-types';
import { CreateApsFacilityTypeDto } from './create-aps-facility-type.dto.js';

export class UpdateApsFacilityTypeDto extends PartialType(CreateApsFacilityTypeDto) {}
