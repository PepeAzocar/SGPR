import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApsFacilityTypesService } from './aps-facility-types.service.js';
import { CreateApsFacilityTypeDto } from './dto/create-aps-facility-type.dto.js';
import { UpdateApsFacilityTypeDto } from './dto/update-aps-facility-type.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@UseGuards(RolesGuard)
@Roles('ADMIN', 'RRHH')
@Controller('aps-facility-types')
export class ApsFacilityTypesController {
  constructor(private readonly service: ApsFacilityTypesService) {}

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateApsFacilityTypeDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateApsFacilityTypeDto) {
    return this.service.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
