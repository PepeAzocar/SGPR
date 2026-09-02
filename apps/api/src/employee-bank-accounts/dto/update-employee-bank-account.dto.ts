import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeBankAccountDto } from './create-employee-bank-account.dto.js';

export class UpdateEmployeeBankAccountDto extends PartialType(CreateEmployeeBankAccountDto) {}
