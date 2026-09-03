import { PartialType } from '@nestjs/mapped-types';
import { CreateApsTrainingActivityDto } from './create-aps-training-activity.dto.js';

export class UpdateApsTrainingActivityDto extends PartialType(CreateApsTrainingActivityDto) {}
