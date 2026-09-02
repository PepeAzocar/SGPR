import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { NationalitiesService } from './nationalities.service.js';
import { CreateNationalityDto } from './dto/create-nationality.dto.js';
import { UpdateNationalityDto } from './dto/update-nationality.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@UseGuards(RolesGuard)
@Controller('nationalities')
export class NationalitiesController {
  constructor(private readonly nationalitiesService: NationalitiesService) {}

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateNationalityDto) {
    return this.nationalitiesService.create(dto);
  }

  @Roles('ADMIN', 'RRHH')
  @Get()
  findAll() {
    return this.nationalitiesService.findAll();
  }

  @Roles('ADMIN', 'RRHH')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nationalitiesService.findOne(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateNationalityDto) {
    return this.nationalitiesService.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nationalitiesService.remove(id);
  }
}
