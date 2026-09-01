import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EmployeePensionSavingsService } from './employee-pension-savings.service.js';
import { CreateEmployeePensionSavingDto } from './dto/create-employee-pension-saving.dto.js';
import { UpdateEmployeePensionSavingDto } from './dto/update-employee-pension-saving.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@UseGuards(RolesGuard)
@Roles('ADMIN', 'RRHH')
@Controller('employee-pension-savings')
export class EmployeePensionSavingsController {
  constructor(private readonly employeePensionSavingsService: EmployeePensionSavingsService) {}

  @Post()
  create(@Body() dto: CreateEmployeePensionSavingDto) {
    return this.employeePensionSavingsService.create(dto);
  }

  @Get()
  findAll(@Query('employeeId') employeeId?: string) {
    return this.employeePensionSavingsService.findAll(employeeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeePensionSavingsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEmployeePensionSavingDto) {
    return this.employeePensionSavingsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeePensionSavingsService.remove(id);
  }
}
