import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { EducationInstitutionTypesService } from './education-institution-types.service.js';
import { CreateEducationInstitutionTypeDto } from './dto/create-education-institution-type.dto.js';
import { UpdateEducationInstitutionTypeDto } from './dto/update-education-institution-type.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@UseGuards(RolesGuard)
@Roles('ADMIN', 'RRHH')
@Controller('education-institution-types')
export class EducationInstitutionTypesController {
  constructor(private readonly service: EducationInstitutionTypesService) {}

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateEducationInstitutionTypeDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateEducationInstitutionTypeDto) {
    return this.service.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
