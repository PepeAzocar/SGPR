import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApsTrainingTypesService } from './aps-training-types.service.js';
import { CreateApsTrainingTypeDto } from './dto/create-aps-training-type.dto.js';
import { UpdateApsTrainingTypeDto } from './dto/update-aps-training-type.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@UseGuards(RolesGuard)
@Roles('ADMIN', 'RRHH')
@Controller('aps-training-types')
export class ApsTrainingTypesController {
  constructor(private readonly service: ApsTrainingTypesService) {}

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateApsTrainingTypeDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateApsTrainingTypeDto) {
    return this.service.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
