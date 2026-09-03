import { PartialType } from '@nestjs/mapped-types';
import { CreateApsTrainingTechnicalLevelDto } from './create-aps-training-technical-level.dto.js';

export class UpdateApsTrainingTechnicalLevelDto extends PartialType(CreateApsTrainingTechnicalLevelDto) {}
