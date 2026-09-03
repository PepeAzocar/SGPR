import { PartialType } from '@nestjs/mapped-types';
import { CreateApsHealthFacilityDto } from './create-aps-health-facility.dto.js';

export class UpdateApsHealthFacilityDto extends PartialType(CreateApsHealthFacilityDto) {}
