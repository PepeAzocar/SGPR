import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PayrollPeriodsService } from './payroll-periods.service.js';
import { CreatePayrollPeriodDto } from './dto/create-payroll-period.dto.js';
import { UpdatePayrollPeriodDto } from './dto/update-payroll-period.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@UseGuards(RolesGuard)
@Roles('ADMIN', 'RRHH')
@Controller('payroll-periods')
export class PayrollPeriodsController {
  constructor(private readonly payrollPeriodsService: PayrollPeriodsService) {}

  @Post()
  create(@Body() dto: CreatePayrollPeriodDto) {
    return this.payrollPeriodsService.create(dto);
  }

  @Get()
  findAll() {
    return this.payrollPeriodsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payrollPeriodsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePayrollPeriodDto) {
    return this.payrollPeriodsService.update(id, dto);
  }

  @Post(':id/calculate')
  calculate(@Param('id') id: string) {
    return this.payrollPeriodsService.calculate(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.payrollPeriodsService.remove(id);
  }
}
