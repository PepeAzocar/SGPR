import { Module } from '@nestjs/common';
import { PayrollResultsService } from './payroll-results.service.js';
import { PayrollResultsController } from './payroll-results.controller.js';

@Module({
  controllers: [PayrollResultsController],
  providers: [PayrollResultsService],
})
export class PayrollResultsModule {}
