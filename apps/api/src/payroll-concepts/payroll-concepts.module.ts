import { Module } from '@nestjs/common';
import { PayrollConceptsService } from './payroll-concepts.service.js';
import { PayrollConceptsController } from './payroll-concepts.controller.js';

@Module({
  controllers: [PayrollConceptsController],
  providers: [PayrollConceptsService],
})
export class PayrollConceptsModule {}
