import { PartialType } from '@nestjs/mapped-types';
import { CreateApsHealthServiceDto } from './create-aps-health-service.dto.js';

export class UpdateApsHealthServiceDto extends PartialType(CreateApsHealthServiceDto) {}
