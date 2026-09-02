import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { EventReasonsService } from './event-reasons.service.js';
import { CreateEventReasonDto } from './dto/create-event-reason.dto.js';
import { UpdateEventReasonDto } from './dto/update-event-reason.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@UseGuards(RolesGuard)
@Controller('event-reasons')
export class EventReasonsController {
  constructor(private readonly eventReasonsService: EventReasonsService) {}

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateEventReasonDto) {
    return this.eventReasonsService.create(dto);
  }

  @Roles('ADMIN', 'RRHH')
  @Get()
  findAll(@Query('eventTypeId') eventTypeId?: string) {
    return this.eventReasonsService.findAll(eventTypeId);
  }

  @Roles('ADMIN', 'RRHH')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventReasonsService.findOne(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEventReasonDto) {
    return this.eventReasonsService.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventReasonsService.remove(id);
  }
}
