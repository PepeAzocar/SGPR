import { PartialType } from '@nestjs/mapped-types';
import { CreateEducationTypeDto } from './create-education-type.dto.js';

export class UpdateEducationTypeDto extends PartialType(CreateEducationTypeDto) {}
