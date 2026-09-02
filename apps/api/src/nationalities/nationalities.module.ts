import { Module } from '@nestjs/common';
import { NationalitiesService } from './nationalities.service.js';
import { NationalitiesController } from './nationalities.controller.js';

@Module({
  controllers: [NationalitiesController],
  providers: [NationalitiesService],
})
export class NationalitiesModule {}
