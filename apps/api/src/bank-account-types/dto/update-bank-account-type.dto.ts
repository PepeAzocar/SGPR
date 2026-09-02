import { PartialType } from '@nestjs/mapped-types';
import { CreateBankAccountTypeDto } from './create-bank-account-type.dto.js';

export class UpdateBankAccountTypeDto extends PartialType(CreateBankAccountTypeDto) {}
