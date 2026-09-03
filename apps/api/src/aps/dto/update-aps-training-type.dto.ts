import { PartialType } from '@nestjs/mapped-types';
import { CreateApsTrainingTypeDto } from './create-aps-training-type.dto.js';

export class UpdateApsTrainingTypeDto extends PartialType(CreateApsTrainingTypeDto) {}
