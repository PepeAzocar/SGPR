import { Module } from '@nestjs/common';
import { TaxBracketsService } from './tax-brackets.service.js';
import { TaxBracketsController } from './tax-brackets.controller.js';

@Module({
  controllers: [TaxBracketsController],
  providers: [TaxBracketsService],
})
export class TaxBracketsModule {}
