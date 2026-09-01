import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeePensionSavingDto } from './create-employee-pension-saving.dto.js';

export class UpdateEmployeePensionSavingDto extends PartialType(CreateEmployeePensionSavingDto) {}
