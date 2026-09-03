import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { EducationInstitutionsService } from './education-institutions.service.js';
import { CreateEducationInstitutionDto } from './dto/create-education-institution.dto.js';
import { UpdateEducationInstitutionDto } from './dto/update-education-institution.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@UseGuards(RolesGuard)
@Roles('ADMIN', 'RRHH')
@Controller('education-institutions')
export class EducationInstitutionsController {
  constructor(private readonly service: EducationInstitutionsService) {}

  @Post()
  create(@Body() dto: CreateEducationInstitutionDto) {
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

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEducationInstitutionDto) {
    return this.service.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
