import { Module } from '@nestjs/common';
import { CommunesService } from './communes.service.js';
import { CommunesController } from './communes.controller.js';

@Module({
  controllers: [CommunesController],
  providers: [CommunesService],
})
export class CommunesModule {}
