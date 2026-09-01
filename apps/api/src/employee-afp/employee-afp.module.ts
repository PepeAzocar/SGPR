import { Module } from '@nestjs/common';
import { EmployeeAfpService } from './employee-afp.service.js';
import { EmployeeAfpController } from './employee-afp.controller.js';

@Module({
  controllers: [EmployeeAfpController],
  providers: [EmployeeAfpService],
})
export class EmployeeAfpModule {}
