import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeApsTrainingDto } from './create-employee-aps-training.dto.js';

export class UpdateEmployeeApsTrainingDto extends PartialType(CreateEmployeeApsTrainingDto) {}
