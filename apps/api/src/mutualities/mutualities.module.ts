import { Module } from '@nestjs/common';
import { MutualitiesService } from './mutualities.service.js';
import { MutualitiesController } from './mutualities.controller.js';

@Module({
  controllers: [MutualitiesController],
  providers: [MutualitiesService],
})
export class MutualitiesModule {}
