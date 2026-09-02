import { Module } from '@nestjs/common';
import { LegalEntitiesService } from './legal-entities.service.js';
import { LegalEntitiesController } from './legal-entities.controller.js';

@Module({
  controllers: [LegalEntitiesController],
  providers: [LegalEntitiesService],
})
export class LegalEntitiesModule {}
