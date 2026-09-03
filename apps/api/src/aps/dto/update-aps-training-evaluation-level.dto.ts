import { PartialType } from '@nestjs/mapped-types';
import { CreateApsTrainingEvaluationLevelDto } from './create-aps-training-evaluation-level.dto.js';

export class UpdateApsTrainingEvaluationLevelDto extends PartialType(CreateApsTrainingEvaluationLevelDto) {}
