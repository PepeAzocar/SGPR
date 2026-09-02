import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ContractTypesService } from './contract-types.service.js';
import { CreateContractTypeDto } from './dto/create-contract-type.dto.js';
import { UpdateContractTypeDto } from './dto/update-contract-type.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@UseGuards(RolesGuard)
@Controller('contract-types')
export class ContractTypesController {
  constructor(private readonly contractTypesService: ContractTypesService) {}

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateContractTypeDto) {
    return this.contractTypesService.create(dto);
  }

  @Roles('ADMIN', 'RRHH')
  @Get()
  findAll(@Query('laborRegimeId') laborRegimeId?: string) {
    return this.contractTypesService.findAll(laborRegimeId);
  }

  @Roles('ADMIN', 'RRHH')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contractTypesService.findOne(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateContractTypeDto) {
    return this.contractTypesService.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contractTypesService.remove(id);
  }
}
