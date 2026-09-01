import { Module } from '@nestjs/common';
import { HealthAffiliationsService } from './health-affiliations.service.js';
import { HealthAffiliationsController } from './health-affiliations.controller.js';

@Module({
  controllers: [HealthAffiliationsController],
  providers: [HealthAffiliationsService],
})
export class HealthAffiliationsModule {}
