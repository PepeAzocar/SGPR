import { PartialType } from '@nestjs/mapped-types';
import { CreateApsEmployeeCategoryDto } from './create-aps-employee-category.dto.js';

export class UpdateApsEmployeeCategoryDto extends PartialType(CreateApsEmployeeCategoryDto) {}
