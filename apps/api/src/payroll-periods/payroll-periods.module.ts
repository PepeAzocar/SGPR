import { Module } from '@nestjs/common';
import { PayrollPeriodsService } from './payroll-periods.service.js';
import { PayrollPeriodsController } from './payroll-periods.controller.js';
import { PayrollModule } from '../payroll/payroll.module.js';

@Module({
  imports: [PayrollModule],
  controllers: [PayrollPeriodsController],
  providers: [PayrollPeriodsService],
})
export class PayrollPeriodsModule {}
