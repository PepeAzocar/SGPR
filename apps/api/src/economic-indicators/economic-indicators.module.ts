import { Module } from '@nestjs/common';
import { EconomicIndicatorsService } from './economic-indicators.service.js';
import { EconomicIndicatorsController } from './economic-indicators.controller.js';

@Module({
  controllers: [EconomicIndicatorsController],
  providers: [EconomicIndicatorsService],
})
export class EconomicIndicatorsModule {}
