import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ContractMatricesService } from './contract-matrices.service.js';
import { CreateContractMatrixDto } from './dto/create-contract-matrix.dto.js';
import { UpdateContractMatrixDto } from './dto/update-contract-matrix.dto.js';
import { CreateMatrixClauseDto } from './dto/create-matrix-clause.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/jwt.strategy.js';

@UseGuards(RolesGuard)
@Roles('ADMIN', 'RRHH')
@Controller('contract-matrices')
export class ContractMatricesController {
  constructor(private readonly service: ContractMatricesService) {}

  @Post()
  create(@Body() dto: CreateContractMatrixDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(dto, user.email);
  }

  @Get()
  findAll(
    @Query('documentType') documentType?: string,
    @Query('status') status?: string,
    @Query('legalRegimeId') legalRegimeId?: string,
  ) {
    return this.service.findAll({ documentType, status, legalRegimeId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateContractMatrixDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.update(id, dto, user.email);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/clauses')
  addClause(@Param('id') id: string, @Body() dto: CreateMatrixClauseDto) {
    return this.service.addClause(id, dto);
  }

  @Delete(':id/clauses/:matrixClauseId')
  removeClause(@Param('id') id: string, @Param('matrixClauseId') matrixClauseId: string) {
    return this.service.removeClause(id, matrixClauseId);
  }

  // Sólo ADMIN activa/desactiva: la matriz es de bajo riesgo comparado con el
  // contenido de plantillas/cláusulas, pero se mantiene la misma separación
  // creador/aprobador que en payroll-formulas.
  @Roles('ADMIN')
  @Post(':id/activate')
  activate(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.activate(id, user.email);
  }

  @Roles('ADMIN')
  @Post(':id/deactivate')
  deactivate(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.deactivate(id, user.email);
  }
}
