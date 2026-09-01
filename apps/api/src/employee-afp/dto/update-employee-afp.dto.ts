import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeAfpDto } from './create-employee-afp.dto.js';

export class UpdateEmployeeAfpDto extends PartialType(CreateEmployeeAfpDto) {}
