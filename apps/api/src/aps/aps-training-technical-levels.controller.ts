import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApsTrainingTechnicalLevelsService } from './aps-training-technical-levels.service.js';
import { CreateApsTrainingTechnicalLevelDto } from './dto/create-aps-training-technical-level.dto.js';
import { UpdateApsTrainingTechnicalLevelDto } from './dto/update-aps-training-technical-level.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@UseGuards(RolesGuard)
@Roles('ADMIN', 'RRHH')
@Controller('aps-training-technical-levels')
export class ApsTrainingTechnicalLevelsController {
  constructor(private readonly service: ApsTrainingTechnicalLevelsService) {}

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateApsTrainingTechnicalLevelDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateApsTrainingTechnicalLevelDto) {
    return this.service.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
