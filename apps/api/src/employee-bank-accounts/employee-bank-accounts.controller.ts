import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { EmployeeBankAccountsService } from './employee-bank-accounts.service.js';
import { CreateEmployeeBankAccountDto } from './dto/create-employee-bank-account.dto.js';
import { UpdateEmployeeBankAccountDto } from './dto/update-employee-bank-account.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@UseGuards(RolesGuard)
@Roles('ADMIN', 'RRHH')
@Controller('employee-bank-accounts')
export class EmployeeBankAccountsController {
  constructor(private readonly employeeBankAccountsService: EmployeeBankAccountsService) {}

  @Post()
  create(@Body() dto: CreateEmployeeBankAccountDto) {
    return this.employeeBankAccountsService.create(dto);
  }

  @Get()
  findAll(@Query('employeeId') employeeId?: string) {
    return this.employeeBankAccountsService.findAll(employeeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeeBankAccountsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEmployeeBankAccountDto) {
    return this.employeeBankAccountsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeeBankAccountsService.remove(id);
  }
}
