import { PartialType } from '@nestjs/mapped-types';
import { CreateAfpEntityDto } from './create-afp-entity.dto.js';

export class UpdateAfpEntityDto extends PartialType(CreateAfpEntityDto) {}
