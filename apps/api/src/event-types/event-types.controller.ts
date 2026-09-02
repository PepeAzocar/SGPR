import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { EventTypesService } from './event-types.service.js';
import { CreateEventTypeDto } from './dto/create-event-type.dto.js';
import { UpdateEventTypeDto } from './dto/update-event-type.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@UseGuards(RolesGuard)
@Controller('event-types')
export class EventTypesController {
  constructor(private readonly eventTypesService: EventTypesService) {}

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateEventTypeDto) {
    return this.eventTypesService.create(dto);
  }

  @Roles('ADMIN', 'RRHH')
  @Get()
  findAll() {
    return this.eventTypesService.findAll();
  }

  @Roles('ADMIN', 'RRHH')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventTypesService.findOne(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEventTypeDto) {
    return this.eventTypesService.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventTypesService.remove(id);
  }
}
