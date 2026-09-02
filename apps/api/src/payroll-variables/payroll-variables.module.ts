import { Module } from '@nestjs/common';
import { PayrollVariablesService } from './payroll-variables.service.js';
import { PayrollVariablesController } from './payroll-variables.controller.js';

@Module({
  controllers: [PayrollVariablesController],
  providers: [PayrollVariablesService],
})
export class PayrollVariablesModule {}
