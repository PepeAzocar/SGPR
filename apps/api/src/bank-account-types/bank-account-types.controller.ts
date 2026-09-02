import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { BankAccountTypesService } from './bank-account-types.service.js';
import { CreateBankAccountTypeDto } from './dto/create-bank-account-type.dto.js';
import { UpdateBankAccountTypeDto } from './dto/update-bank-account-type.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@UseGuards(RolesGuard)
@Controller('bank-account-types')
export class BankAccountTypesController {
  constructor(private readonly bankAccountTypesService: BankAccountTypesService) {}

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateBankAccountTypeDto) {
    return this.bankAccountTypesService.create(dto);
  }

  @Roles('ADMIN', 'RRHH')
  @Get()
  findAll() {
    return this.bankAccountTypesService.findAll();
  }

  @Roles('ADMIN', 'RRHH')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bankAccountTypesService.findOne(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBankAccountTypeDto) {
    return this.bankAccountTypesService.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bankAccountTypesService.remove(id);
  }
}
