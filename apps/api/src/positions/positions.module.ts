import { Module } from '@nestjs/common';
import { PositionsService } from './positions.service.js';
import { PositionsController } from './positions.controller.js';

@Module({
  controllers: [PositionsController],
  providers: [PositionsService],
})
export class PositionsModule {}
