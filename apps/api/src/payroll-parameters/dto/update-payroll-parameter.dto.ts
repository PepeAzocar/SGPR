import { PartialType } from '@nestjs/mapped-types';
import { CreatePayrollParameterDto } from './create-payroll-parameter.dto.js';

export class UpdatePayrollParameterDto extends PartialType(CreatePayrollParameterDto) {}
