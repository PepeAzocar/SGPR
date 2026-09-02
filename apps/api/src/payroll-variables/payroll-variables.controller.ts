import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { PayrollVariablesService } from './payroll-variables.service.js';
import { CreatePayrollVariableDto } from './dto/create-payroll-variable.dto.js';
import { UpdatePayrollVariableDto } from './dto/update-payroll-variable.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@UseGuards(RolesGuard)
@Controller('payroll-variables')
export class PayrollVariablesController {
  constructor(private readonly payrollVariablesService: PayrollVariablesService) {}

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreatePayrollVariableDto) {
    return this.payrollVariablesService.create(dto);
  }

  @Roles('ADMIN', 'RRHH')
  @Get()
  findAll() {
    return this.payrollVariablesService.findAll();
  }

  @Roles('ADMIN', 'RRHH')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payrollVariablesService.findOne(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePayrollVariableDto) {
    return this.payrollVariablesService.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.payrollVariablesService.remove(id);
  }
}
