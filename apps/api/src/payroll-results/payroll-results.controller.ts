import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { PayrollResultsService } from './payroll-results.service.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@UseGuards(RolesGuard)
@Roles('ADMIN', 'RRHH')
@Controller('payroll-results')
export class PayrollResultsController {
  constructor(private readonly payrollResultsService: PayrollResultsService) {}

  @Get()
  findAll(
    @Query('employeeId') employeeId?: string,
    @Query('payrollPeriodId') payrollPeriodId?: string,
    @Query('current') current?: string,
  ) {
    return this.payrollResultsService.findAll({
      employeeId,
      payrollPeriodId,
      current: current === undefined ? undefined : current !== 'false',
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payrollResultsService.findOne(id);
  }
}
