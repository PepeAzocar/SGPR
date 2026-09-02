import { PartialType } from '@nestjs/mapped-types';
import { CreatePayrollTableDto } from './create-payroll-table.dto.js';

export class UpdatePayrollTableDto extends PartialType(CreatePayrollTableDto) {}
