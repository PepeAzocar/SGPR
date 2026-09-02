import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { PayrollParametersService } from './payroll-parameters.service.js';
import { CreatePayrollParameterDto } from './dto/create-payroll-parameter.dto.js';
import { UpdatePayrollParameterDto } from './dto/update-payroll-parameter.dto.js';
import { AddPayrollParameterValueDto } from './dto/add-payroll-parameter-value.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@UseGuards(RolesGuard)
@Controller('payroll-parameters')
export class PayrollParametersController {
  constructor(private readonly payrollParametersService: PayrollParametersService) {}

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreatePayrollParameterDto) {
    return this.payrollParametersService.create(dto);
  }

  @Roles('ADMIN', 'RRHH')
  @Get()
  findAll() {
    return this.payrollParametersService.findAll();
  }

  @Roles('ADMIN', 'RRHH')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payrollParametersService.findOne(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePayrollParameterDto) {
    return this.payrollParametersService.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.payrollParametersService.remove(id);
  }

  @Roles('ADMIN')
  @Post(':id/values')
  addValue(@Param('id') id: string, @Body() dto: AddPayrollParameterValueDto) {
    return this.payrollParametersService.addValue(id, dto);
  }
}
