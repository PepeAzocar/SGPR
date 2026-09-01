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
import { HealthInstitutionsService } from './health-institutions.service.js';
import { CreateHealthInstitutionDto } from './dto/create-health-institution.dto.js';
import { UpdateHealthInstitutionDto } from './dto/update-health-institution.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@UseGuards(RolesGuard)
@Controller('health-institutions')
export class HealthInstitutionsController {
  constructor(private readonly healthInstitutionsService: HealthInstitutionsService) {}

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateHealthInstitutionDto) {
    return this.healthInstitutionsService.create(dto);
  }

  @Roles('ADMIN', 'RRHH')
  @Get()
  findAll() {
    return this.healthInstitutionsService.findAll();
  }

  @Roles('ADMIN', 'RRHH')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.healthInstitutionsService.findOne(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateHealthInstitutionDto) {
    return this.healthInstitutionsService.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.healthInstitutionsService.remove(id);
  }
}
