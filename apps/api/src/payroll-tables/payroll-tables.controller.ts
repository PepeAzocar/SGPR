import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { PayrollTablesService } from './payroll-tables.service.js';
import { CreatePayrollTableDto } from './dto/create-payroll-table.dto.js';
import { UpdatePayrollTableDto } from './dto/update-payroll-table.dto.js';
import { CreatePayrollTableRowDto } from './dto/create-payroll-table-row.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@UseGuards(RolesGuard)
@Controller('payroll-tables')
export class PayrollTablesController {
  constructor(private readonly payrollTablesService: PayrollTablesService) {}

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreatePayrollTableDto) {
    return this.payrollTablesService.create(dto);
  }

  @Roles('ADMIN', 'RRHH')
  @Get()
  findAll() {
    return this.payrollTablesService.findAll();
  }

  @Roles('ADMIN', 'RRHH')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payrollTablesService.findOne(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePayrollTableDto) {
    return this.payrollTablesService.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.payrollTablesService.remove(id);
  }

  @Roles('ADMIN')
  @Post(':id/rows')
  addRow(@Param('id') id: string, @Body() dto: CreatePayrollTableRowDto) {
    return this.payrollTablesService.addRow(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id/rows/:rowId')
  removeRow(@Param('id') id: string, @Param('rowId') rowId: string) {
    return this.payrollTablesService.removeRow(id, rowId);
  }
}
