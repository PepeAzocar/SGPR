import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApsLaborInstitutionsService } from './aps-labor-institutions.service.js';
import { CreateApsLaborInstitutionDto } from './dto/create-aps-labor-institution.dto.js';
import { UpdateApsLaborInstitutionDto } from './dto/update-aps-labor-institution.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@UseGuards(RolesGuard)
@Roles('ADMIN', 'RRHH')
@Controller('aps-labor-institutions')
export class ApsLaborInstitutionsController {
  constructor(private readonly service: ApsLaborInstitutionsService) {}

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateApsLaborInstitutionDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateApsLaborInstitutionDto) {
    return this.service.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
