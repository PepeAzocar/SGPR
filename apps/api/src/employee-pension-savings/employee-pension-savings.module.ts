import { Module } from '@nestjs/common';
import { EmployeePensionSavingsService } from './employee-pension-savings.service.js';
import { EmployeePensionSavingsController } from './employee-pension-savings.controller.js';

@Module({
  controllers: [EmployeePensionSavingsController],
  providers: [EmployeePensionSavingsService],
})
export class EmployeePensionSavingsModule {}
