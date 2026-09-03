import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApsContractProfilesService } from './aps-contract-profiles.service.js';
import { CreateApsContractProfileDto } from './dto/create-aps-contract-profile.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

// Extiende Contratos: sólo tiene sentido cuando el contrato es régimen
// Ley N°19.378 (validado en el service). El frontend muestra esta pestaña
// únicamente cuando el contrato seleccionado tiene ese régimen jurídico.
@UseGuards(RolesGuard)
@Roles('ADMIN', 'RRHH')
@Controller('contracts/:contractId/aps-profile')
export class ApsContractProfilesController {
  constructor(private readonly service: ApsContractProfilesService) {}

  @Get()
  findCurrent(@Param('contractId') contractId: string) {
    return this.service.findCurrent(contractId);
  }

  @Get('history')
  history(@Param('contractId') contractId: string) {
    return this.service.history(contractId);
  }

  @Post()
  create(@Param('contractId') contractId: string, @Body() dto: CreateApsContractProfileDto) {
    return this.service.create(contractId, dto);
  }
}
