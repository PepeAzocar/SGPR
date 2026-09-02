import { Module } from '@nestjs/common';
import { EventReasonsService } from './event-reasons.service.js';
import { EventReasonsController } from './event-reasons.controller.js';

@Module({
  controllers: [EventReasonsController],
  providers: [EventReasonsService],
})
export class EventReasonsModule {}
