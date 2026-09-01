import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { HealthAffiliationsService } from './health-affiliations.service.js';
import { CreateHealthAffiliationDto } from './dto/create-health-affiliation.dto.js';
import { UpdateHealthAffiliationDto } from './dto/update-health-affiliation.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@UseGuards(RolesGuard)
@Roles('ADMIN', 'RRHH')
@Controller('health-affiliations')
export class HealthAffiliationsController {
  constructor(private readonly healthAffiliationsService: HealthAffiliationsService) {}

  @Post()
  create(@Body() dto: CreateHealthAffiliationDto) {
    return this.healthAffiliationsService.create(dto);
  }

  @Get()
  findAll(@Query('employeeId') employeeId?: string) {
    return this.healthAffiliationsService.findAll(employeeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.healthAffiliationsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateHealthAffiliationDto) {
    return this.healthAffiliationsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.healthAffiliationsService.remove(id);
  }
}
