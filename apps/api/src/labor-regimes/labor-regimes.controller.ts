import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { LaborRegimesService } from './labor-regimes.service.js';
import { CreateLaborRegimeDto } from './dto/create-labor-regime.dto.js';
import { UpdateLaborRegimeDto } from './dto/update-labor-regime.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@UseGuards(RolesGuard)
@Controller('labor-regimes')
export class LaborRegimesController {
  constructor(private readonly laborRegimesService: LaborRegimesService) {}

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateLaborRegimeDto) {
    return this.laborRegimesService.create(dto);
  }

  @Roles('ADMIN', 'RRHH')
  @Get()
  findAll() {
    return this.laborRegimesService.findAll();
  }

  @Roles('ADMIN', 'RRHH')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.laborRegimesService.findOne(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLaborRegimeDto) {
    return this.laborRegimesService.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.laborRegimesService.remove(id);
  }
}
