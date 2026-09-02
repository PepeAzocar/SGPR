import { Module } from '@nestjs/common';
import { EmployeeBankAccountsService } from './employee-bank-accounts.service.js';
import { EmployeeBankAccountsController } from './employee-bank-accounts.controller.js';

@Module({
  controllers: [EmployeeBankAccountsController],
  providers: [EmployeeBankAccountsService],
})
export class EmployeeBankAccountsModule {}
