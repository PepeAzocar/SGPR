import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApsTrainingEvaluationLevelsService } from './aps-training-evaluation-levels.service.js';
import { CreateApsTrainingEvaluationLevelDto } from './dto/create-aps-training-evaluation-level.dto.js';
import { UpdateApsTrainingEvaluationLevelDto } from './dto/update-aps-training-evaluation-level.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@UseGuards(RolesGuard)
@Roles('ADMIN', 'RRHH')
@Controller('aps-training-evaluation-levels')
export class ApsTrainingEvaluationLevelsController {
  constructor(private readonly service: ApsTrainingEvaluationLevelsService) {}

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateApsTrainingEvaluationLevelDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateApsTrainingEvaluationLevelDto) {
    return this.service.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
