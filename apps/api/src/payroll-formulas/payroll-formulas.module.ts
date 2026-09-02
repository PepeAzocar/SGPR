import { Module } from '@nestjs/common';
import { PayrollFormulasService } from './payroll-formulas.service.js';
import { PayrollFormulasController } from './payroll-formulas.controller.js';

@Module({
  controllers: [PayrollFormulasController],
  providers: [PayrollFormulasService],
})
export class PayrollFormulasModule {}
