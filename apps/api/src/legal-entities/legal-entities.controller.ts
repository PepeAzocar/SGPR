import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { LegalEntitiesService } from './legal-entities.service.js';
import { CreateLegalEntityDto } from './dto/create-legal-entity.dto.js';
import { UpdateLegalEntityDto } from './dto/update-legal-entity.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/jwt.strategy.js';

@UseGuards(RolesGuard)
@Controller('legal-entities')
export class LegalEntitiesController {
  constructor(private readonly legalEntitiesService: LegalEntitiesService) {}

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateLegalEntityDto, @CurrentUser() user: AuthenticatedUser) {
    return this.legalEntitiesService.create(dto, user.email);
  }

  @Roles('ADMIN', 'RRHH')
  @Get()
  findAll() {
    return this.legalEntitiesService.findAll();
  }

  @Roles('ADMIN', 'RRHH')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.legalEntitiesService.findOne(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLegalEntityDto, @CurrentUser() user: AuthenticatedUser) {
    return this.legalEntitiesService.update(id, dto, user.email);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.legalEntitiesService.remove(id);
  }
}
