import { Module } from '@nestjs/common';
import { HealthInstitutionsService } from './health-institutions.service.js';
import { HealthInstitutionsController } from './health-institutions.controller.js';

@Module({
  controllers: [HealthInstitutionsController],
  providers: [HealthInstitutionsService],
})
export class HealthInstitutionsModule {}
