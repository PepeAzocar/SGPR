import { PartialType } from '@nestjs/mapped-types';
import { CreatePayrollConceptDto } from './create-payroll-concept.dto.js';

export class UpdatePayrollConceptDto extends PartialType(CreatePayrollConceptDto) {}
