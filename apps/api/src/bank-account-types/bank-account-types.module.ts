import { Module } from '@nestjs/common';
import { BankAccountTypesService } from './bank-account-types.service.js';
import { BankAccountTypesController } from './bank-account-types.controller.js';

@Module({
  controllers: [BankAccountTypesController],
  providers: [BankAccountTypesService],
})
export class BankAccountTypesModule {}
