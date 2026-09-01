import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { PayslipsService } from './payslips.service.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@UseGuards(RolesGuard)
@Roles('ADMIN', 'RRHH')
@Controller('payslips')
export class PayslipsController {
  constructor(private readonly payslipsService: PayslipsService) {}

  @Get()
  findAll(@Query('employeeId') employeeId?: string, @Query('periodId') periodId?: string) {
    return this.payslipsService.findAll(employeeId, periodId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payslipsService.findOne(id);
  }
}
