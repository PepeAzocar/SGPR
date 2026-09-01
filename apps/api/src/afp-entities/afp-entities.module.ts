import { Module } from '@nestjs/common';
import { AfpEntitiesService } from './afp-entities.service.js';
import { AfpEntitiesController } from './afp-entities.controller.js';

@Module({
  controllers: [AfpEntitiesController],
  providers: [AfpEntitiesService],
})
export class AfpEntitiesModule {}
