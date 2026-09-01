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
import { EconomicIndicatorsService } from './economic-indicators.service.js';
import { CreateEconomicIndicatorDto } from './dto/create-economic-indicator.dto.js';
import { UpdateEconomicIndicatorDto } from './dto/update-economic-indicator.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@UseGuards(RolesGuard)
@Roles('ADMIN')
@Controller('economic-indicators')
export class EconomicIndicatorsController {
  constructor(private readonly economicIndicatorsService: EconomicIndicatorsService) {}

  @Post()
  create(@Body() dto: CreateEconomicIndicatorDto) {
    return this.economicIndicatorsService.create(dto);
  }

  @Get()
  findAll() {
    return this.economicIndicatorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.economicIndicatorsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEconomicIndicatorDto) {
    return this.economicIndicatorsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.economicIndicatorsService.remove(id);
  }
}
