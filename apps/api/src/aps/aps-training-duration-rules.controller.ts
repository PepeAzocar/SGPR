import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApsTrainingDurationRulesService } from './aps-training-duration-rules.service.js';
import { CreateApsTrainingDurationRuleDto } from './dto/create-aps-training-duration-rule.dto.js';
import { UpdateApsTrainingDurationRuleDto } from './dto/update-aps-training-duration-rule.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@UseGuards(RolesGuard)
@Roles('ADMIN', 'RRHH')
@Controller('aps-training-duration-rules')
export class ApsTrainingDurationRulesController {
  constructor(private readonly service: ApsTrainingDurationRulesService) {}

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateApsTrainingDurationRuleDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateApsTrainingDurationRuleDto) {
    return this.service.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
