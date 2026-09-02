import { Module } from '@nestjs/common';
import { PayrollParametersService } from './payroll-parameters.service.js';
import { PayrollParametersController } from './payroll-parameters.controller.js';

@Module({
  controllers: [PayrollParametersController],
  providers: [PayrollParametersService],
})
export class PayrollParametersModule {}
