import { Module } from '@nestjs/common';
import { CcafsService } from './ccafs.service.js';
import { CcafsController } from './ccafs.controller.js';

@Module({
  controllers: [CcafsController],
  providers: [CcafsService],
})
export class CcafsModule {}
