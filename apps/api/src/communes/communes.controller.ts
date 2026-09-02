import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CommunesService } from './communes.service.js';
import { CreateCommuneDto } from './dto/create-commune.dto.js';
import { UpdateCommuneDto } from './dto/update-commune.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@UseGuards(RolesGuard)
@Controller('communes')
export class CommunesController {
  constructor(private readonly communesService: CommunesService) {}

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateCommuneDto) {
    return this.communesService.create(dto);
  }

  @Roles('ADMIN', 'RRHH')
  @Get()
  findAll(@Query('regionId') regionId?: string) {
    return this.communesService.findAll(regionId);
  }

  @Roles('ADMIN', 'RRHH')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.communesService.findOne(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCommuneDto) {
    return this.communesService.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.communesService.remove(id);
  }
}
