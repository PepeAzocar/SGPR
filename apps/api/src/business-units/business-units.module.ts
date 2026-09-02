import { Module } from '@nestjs/common';
import { BusinessUnitsService } from './business-units.service.js';
import { BusinessUnitsController } from './business-units.controller.js';

@Module({
  controllers: [BusinessUnitsController],
  providers: [BusinessUnitsService],
})
export class BusinessUnitsModule {}
