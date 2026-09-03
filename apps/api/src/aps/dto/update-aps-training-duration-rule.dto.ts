import { PartialType } from '@nestjs/mapped-types';
import { CreateApsTrainingDurationRuleDto } from './create-aps-training-duration-rule.dto.js';

export class UpdateApsTrainingDurationRuleDto extends PartialType(CreateApsTrainingDurationRuleDto) {}
