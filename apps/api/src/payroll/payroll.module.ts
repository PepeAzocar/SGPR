import { Module } from '@nestjs/common';
import { PayrollCalculatorService } from './chile/payroll-calculator.service.js';

@Module({
  providers: [PayrollCalculatorService],
  exports: [PayrollCalculatorService],
})
export class PayrollModule {}
