import { Module } from '@nestjs/common';
import { PayrollTablesService } from './payroll-tables.service.js';
import { PayrollTablesController } from './payroll-tables.controller.js';

@Module({
  controllers: [PayrollTablesController],
  providers: [PayrollTablesService],
})
export class PayrollTablesModule {}
