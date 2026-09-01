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
import { PayrollConceptsService } from './payroll-concepts.service.js';
import { CreatePayrollConceptDto } from './dto/create-payroll-concept.dto.js';
import { UpdatePayrollConceptDto } from './dto/update-payroll-concept.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@UseGuards(RolesGuard)
@Roles('ADMIN', 'RRHH')
@Controller('payroll-concepts')
export class PayrollConceptsController {
  constructor(private readonly payrollConceptsService: PayrollConceptsService) {}

  @Post()
  create(@Body() dto: CreatePayrollConceptDto) {
    return this.payrollConceptsService.create(dto);
  }

  @Get()
  findAll() {
    return this.payrollConceptsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payrollConceptsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePayrollConceptDto) {
    return this.payrollConceptsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.payrollConceptsService.remove(id);
  }
}
