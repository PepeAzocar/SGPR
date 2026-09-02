import { Module } from '@nestjs/common';
import { BanksService } from './banks.service.js';
import { BanksController } from './banks.controller.js';

@Module({
  controllers: [BanksController],
  providers: [BanksService],
})
export class BanksModule {}
