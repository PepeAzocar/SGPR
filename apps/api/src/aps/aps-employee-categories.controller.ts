import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApsEmployeeCategoriesService } from './aps-employee-categories.service.js';
import { CreateApsEmployeeCategoryDto } from './dto/create-aps-employee-category.dto.js';
import { UpdateApsEmployeeCategoryDto } from './dto/update-aps-employee-category.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@UseGuards(RolesGuard)
@Roles('ADMIN', 'RRHH')
@Controller('aps-employee-categories')
export class ApsEmployeeCategoriesController {
  constructor(private readonly service: ApsEmployeeCategoriesService) {}

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateApsEmployeeCategoryDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateApsEmployeeCategoryDto) {
    return this.service.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
