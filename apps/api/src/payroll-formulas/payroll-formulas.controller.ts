import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PayrollFormulasService } from './payroll-formulas.service.js';
import { CreatePayrollFormulaDto } from './dto/create-payroll-formula.dto.js';
import { UpdatePayrollFormulaDto } from './dto/update-payroll-formula.dto.js';
import { EvaluateFormulaDto } from './dto/evaluate-formula.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/jwt.strategy.js';

@UseGuards(RolesGuard)
@Roles('ADMIN', 'RRHH')
@Controller('payroll-formulas')
export class PayrollFormulasController {
  constructor(private readonly payrollFormulasService: PayrollFormulasService) {}

  @Post()
  create(@Body() dto: CreatePayrollFormulaDto, @CurrentUser() user: AuthenticatedUser) {
    return this.payrollFormulasService.create(dto, user.email);
  }

  @Post('evaluate')
  evaluate(@Body() dto: EvaluateFormulaDto) {
    return this.payrollFormulasService.evaluate(dto);
  }

  @Get()
  findAll(
    @Query('conceptId') conceptId?: string,
    @Query('status') status?: string,
    @Query('laborRegimeId') laborRegimeId?: string,
  ) {
    return this.payrollFormulasService.findAll({ conceptId, status, laborRegimeId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payrollFormulasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePayrollFormulaDto) {
    return this.payrollFormulasService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.payrollFormulasService.remove(id);
  }

  @Post(':id/submit-test')
  submitForTesting(@Param('id') id: string) {
    return this.payrollFormulasService.submitForTesting(id);
  }

  @Post(':id/submit-approval')
  submitForApproval(@Param('id') id: string) {
    return this.payrollFormulasService.submitForApproval(id);
  }

  // La separación creador/aprobador se resuelve con roles: RRHH crea y prueba,
  // sólo ADMIN aprueba, rechaza, activa y desactiva.
  @Roles('ADMIN')
  @Post(':id/approve')
  approve(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.payrollFormulasService.approve(id, user.email);
  }

  @Roles('ADMIN')
  @Post(':id/reject')
  reject(@Param('id') id: string) {
    return this.payrollFormulasService.reject(id);
  }

  @Roles('ADMIN')
  @Post(':id/activate')
  activate(@Param('id') id: string) {
    return this.payrollFormulasService.activate(id);
  }

  @Roles('ADMIN')
  @Post(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.payrollFormulasService.deactivate(id);
  }
}
