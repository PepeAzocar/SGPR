import { Module } from '@nestjs/common';
import { ContractTypesService } from './contract-types.service.js';
import { ContractTypesController } from './contract-types.controller.js';

@Module({
  controllers: [ContractTypesController],
  providers: [ContractTypesService],
})
export class ContractTypesModule {}
