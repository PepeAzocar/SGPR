import { Module } from '@nestjs/common';
import { DivisionsService } from './divisions.service.js';
import { DivisionsController } from './divisions.controller.js';

@Module({
  controllers: [DivisionsController],
  providers: [DivisionsService],
})
export class DivisionsModule {}
