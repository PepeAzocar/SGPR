import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { MutualitiesService } from './mutualities.service.js';
import { CreateMutualityDto } from './dto/create-mutuality.dto.js';
import { UpdateMutualityDto } from './dto/update-mutuality.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@UseGuards(RolesGuard)
@Controller('mutualities')
export class MutualitiesController {
  constructor(private readonly mutualitiesService: MutualitiesService) {}

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateMutualityDto) {
    return this.mutualitiesService.create(dto);
  }

  @Roles('ADMIN', 'RRHH')
  @Get()
  findAll() {
    return this.mutualitiesService.findAll();
  }

  @Roles('ADMIN', 'RRHH')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mutualitiesService.findOne(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMutualityDto) {
    return this.mutualitiesService.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mutualitiesService.remove(id);
  }
}
