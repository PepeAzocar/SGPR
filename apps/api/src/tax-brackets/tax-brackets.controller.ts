import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TaxBracketsService } from './tax-brackets.service.js';
import { CreateTaxBracketDto } from './dto/create-tax-bracket.dto.js';
import { UpdateTaxBracketDto } from './dto/update-tax-bracket.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@UseGuards(RolesGuard)
@Roles('ADMIN')
@Controller('tax-brackets')
export class TaxBracketsController {
  constructor(private readonly taxBracketsService: TaxBracketsService) {}

  @Post()
  create(@Body() dto: CreateTaxBracketDto) {
    return this.taxBracketsService.create(dto);
  }

  @Get()
  findAll() {
    return this.taxBracketsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.taxBracketsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTaxBracketDto) {
    return this.taxBracketsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.taxBracketsService.remove(id);
  }
}
