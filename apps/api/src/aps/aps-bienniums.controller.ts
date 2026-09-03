import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApsBienniumsService } from './aps-bienniums.service.js';
import { CreateApsBienniumDto } from './dto/create-aps-biennium.dto.js';
import { UpdateApsBienniumDto } from './dto/update-aps-biennium.dto.js';
import { CreateApsRecognizedServiceDto } from './dto/create-aps-recognized-service.dto.js';
import { UpdateApsRecognizedServiceDto } from './dto/update-aps-recognized-service.dto.js';
import { CreateApsServiceExclusionDto } from './dto/create-aps-service-exclusion.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

// Control Bienal (Gestión de Personas) — maestro: bienio; detalle: servicios
// reconocidos; sub-detalle: exclusiones de cada servicio.
@UseGuards(RolesGuard)
@Roles('ADMIN', 'RRHH')
@Controller('aps-bienniums')
export class ApsBienniumsController {
  constructor(private readonly service: ApsBienniumsService) {}

  @Post()
  create(@Body() dto: CreateApsBienniumDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateApsBienniumDto) {
    return this.service.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/services')
  addService(@Param('id') id: string, @Body() dto: CreateApsRecognizedServiceDto) {
    return this.service.addService(id, dto);
  }

  @Patch(':id/services/:serviceId')
  updateService(
    @Param('id') id: string,
    @Param('serviceId') serviceId: string,
    @Body() dto: UpdateApsRecognizedServiceDto,
  ) {
    return this.service.updateService(id, serviceId, dto);
  }

  @Delete(':id/services/:serviceId')
  removeService(@Param('id') id: string, @Param('serviceId') serviceId: string) {
    return this.service.removeService(id, serviceId);
  }

  @Post(':id/services/:serviceId/exclusions')
  addExclusion(
    @Param('id') id: string,
    @Param('serviceId') serviceId: string,
    @Body() dto: CreateApsServiceExclusionDto,
  ) {
    return this.service.addExclusion(id, serviceId, dto);
  }

  @Delete(':id/services/:serviceId/exclusions/:exclusionId')
  removeExclusion(
    @Param('id') id: string,
    @Param('serviceId') serviceId: string,
    @Param('exclusionId') exclusionId: string,
  ) {
    return this.service.removeExclusion(id, serviceId, exclusionId);
  }
}
