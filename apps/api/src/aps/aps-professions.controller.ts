import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApsProfessionsService } from './aps-professions.service.js';
import { CreateApsProfessionDto } from './dto/create-aps-profession.dto.js';
import { UpdateApsProfessionDto } from './dto/update-aps-profession.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@UseGuards(RolesGuard)
@Roles('ADMIN', 'RRHH')
@Controller('aps-professions')
export class ApsProfessionsController {
  constructor(private readonly service: ApsProfessionsService) {}

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateApsProfessionDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateApsProfessionDto) {
    return this.service.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
