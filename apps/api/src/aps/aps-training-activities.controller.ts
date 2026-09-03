import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApsTrainingActivitiesService } from './aps-training-activities.service.js';
import { CreateApsTrainingActivityDto } from './dto/create-aps-training-activity.dto.js';
import { UpdateApsTrainingActivityDto } from './dto/update-aps-training-activity.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@UseGuards(RolesGuard)
@Roles('ADMIN', 'RRHH')
@Controller('aps-training-activities')
export class ApsTrainingActivitiesController {
  constructor(private readonly service: ApsTrainingActivitiesService) {}

  @Post()
  create(@Body() dto: CreateApsTrainingActivityDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateApsTrainingActivityDto) {
    return this.service.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
