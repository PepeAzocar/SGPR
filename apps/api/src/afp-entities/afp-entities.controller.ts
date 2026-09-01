import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AfpEntitiesService } from './afp-entities.service.js';
import { CreateAfpEntityDto } from './dto/create-afp-entity.dto.js';
import { UpdateAfpEntityDto } from './dto/update-afp-entity.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@UseGuards(RolesGuard)
@Controller('afp-entities')
export class AfpEntitiesController {
  constructor(private readonly afpEntitiesService: AfpEntitiesService) {}

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateAfpEntityDto) {
    return this.afpEntitiesService.create(dto);
  }

  @Roles('ADMIN', 'RRHH')
  @Get()
  findAll() {
    return this.afpEntitiesService.findAll();
  }

  @Roles('ADMIN', 'RRHH')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.afpEntitiesService.findOne(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAfpEntityDto) {
    return this.afpEntitiesService.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.afpEntitiesService.remove(id);
  }
}
