import { Module } from '@nestjs/common';
import { EventTypesService } from './event-types.service.js';
import { EventTypesController } from './event-types.controller.js';

@Module({
  controllers: [EventTypesController],
  providers: [EventTypesService],
})
export class EventTypesModule {}
