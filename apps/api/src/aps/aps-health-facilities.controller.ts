import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApsHealthFacilitiesService } from './aps-health-facilities.service.js';
import { CreateApsHealthFacilityDto } from './dto/create-aps-health-facility.dto.js';
import { UpdateApsHealthFacilityDto } from './dto/update-aps-health-facility.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@UseGuards(RolesGuard)
@Roles('ADMIN', 'RRHH')
@Controller('aps-health-facilities')
export class ApsHealthFacilitiesController {
  constructor(private readonly service: ApsHealthFacilitiesService) {}

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateApsHealthFacilityDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateApsHealthFacilityDto) {
    return this.service.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
