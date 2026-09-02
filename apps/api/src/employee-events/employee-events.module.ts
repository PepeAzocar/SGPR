import { Module } from '@nestjs/common';
import { EmployeeEventsService } from './employee-events.service.js';
import { EmployeeEventsController } from './employee-events.controller.js';

@Module({
  controllers: [EmployeeEventsController],
  providers: [EmployeeEventsService],
})
export class EmployeeEventsModule {}
