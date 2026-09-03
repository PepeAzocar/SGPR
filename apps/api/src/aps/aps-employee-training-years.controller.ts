import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApsEmployeeTrainingYearsService } from './aps-employee-training-years.service.js';
import { CreateApsEmployeeTrainingYearDto } from './dto/create-aps-employee-training-year.dto.js';
import { UpdateApsEmployeeTrainingYearDto } from './dto/update-aps-employee-training-year.dto.js';
import { CreateEmployeeApsTrainingDto } from './dto/create-employee-aps-training.dto.js';
import { UpdateEmployeeApsTrainingDto } from './dto/update-employee-aps-training.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

// Control de Capacitación (Gestión de Personas) — maestro: control anual por
// funcionario; detalle: cada curso tomado ese año.
@UseGuards(RolesGuard)
@Roles('ADMIN', 'RRHH')
@Controller('aps-employee-training-years')
export class ApsEmployeeTrainingYearsController {
  constructor(private readonly service: ApsEmployeeTrainingYearsService) {}

  @Post()
  create(@Body() dto: CreateApsEmployeeTrainingYearDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query('employeeId') employeeId?: string) {
    return this.service.findAll(employeeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateApsEmployeeTrainingYearDto) {
    return this.service.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/trainings')
  addTraining(@Param('id') id: string, @Body() dto: CreateEmployeeApsTrainingDto) {
    return this.service.addTraining(id, dto);
  }

  @Patch(':id/trainings/:trainingId')
  updateTraining(
    @Param('id') id: string,
    @Param('trainingId') trainingId: string,
    @Body() dto: UpdateEmployeeApsTrainingDto,
  ) {
    return this.service.updateTraining(id, trainingId, dto);
  }

  @Delete(':id/trainings/:trainingId')
  removeTraining(@Param('id') id: string, @Param('trainingId') trainingId: string) {
    return this.service.removeTraining(id, trainingId);
  }
}
