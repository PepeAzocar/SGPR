import { Module } from '@nestjs/common';
import { LaborRegimesService } from './labor-regimes.service.js';
import { LaborRegimesController } from './labor-regimes.controller.js';

@Module({
  controllers: [LaborRegimesController],
  providers: [LaborRegimesService],
})
export class LaborRegimesModule {}
