import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApsHealthServicesService } from './aps-health-services.service.js';
import { CreateApsHealthServiceDto } from './dto/create-aps-health-service.dto.js';
import { UpdateApsHealthServiceDto } from './dto/update-aps-health-service.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@UseGuards(RolesGuard)
@Roles('ADMIN', 'RRHH')
@Controller('aps-health-services')
export class ApsHealthServicesController {
  constructor(private readonly service: ApsHealthServicesService) {}

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateApsHealthServiceDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateApsHealthServiceDto) {
    return this.service.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
