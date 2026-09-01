import { Module } from '@nestjs/common';
import { PayslipsService } from './payslips.service.js';
import { PayslipsController } from './payslips.controller.js';

@Module({
  controllers: [PayslipsController],
  providers: [PayslipsService],
})
export class PayslipsModule {}
