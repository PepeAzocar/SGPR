import { PartialType } from '@nestjs/mapped-types';
import { CreatePayrollFormulaDto } from './create-payroll-formula.dto.js';

export class UpdatePayrollFormulaDto extends PartialType(CreatePayrollFormulaDto) {}
