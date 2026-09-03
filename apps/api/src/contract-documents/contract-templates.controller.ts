import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ContractTemplatesService } from './contract-templates.service.js';
import { CreateContractTemplateDto } from './dto/create-contract-template.dto.js';
import { UpdateContractTemplateDto } from './dto/update-contract-template.dto.js';
import { CreateTemplateVersionDto } from './dto/create-template-version.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/jwt.strategy.js';

@UseGuards(RolesGuard)
@Roles('ADMIN', 'RRHH')
@Controller('contract-templates')
export class ContractTemplatesController {
  constructor(private readonly service: ContractTemplatesService) {}

  @Post()
  create(@Body() dto: CreateContractTemplateDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(dto, user.email);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateContractTemplateDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/versions')
  createVersion(@Param('id') id: string, @Body() dto: CreateTemplateVersionDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.createVersion(id, dto, user.email);
  }

  @Patch('versions/:versionId')
  updateVersion(@Param('versionId') versionId: string, @Body() dto: CreateTemplateVersionDto) {
    return this.service.updateVersion(versionId, dto);
  }

  // Sólo ADMIN publica/retira: el contenido publicado queda congelado para
  // cualquier documento ya generado con esa versión.
  @Roles('ADMIN')
  @Post('versions/:versionId/publish')
  publishVersion(@Param('versionId') versionId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.publishVersion(versionId, user.email);
  }

  @Roles('ADMIN')
  @Post('versions/:versionId/retire')
  retireVersion(@Param('versionId') versionId: string) {
    return this.service.retireVersion(versionId);
  }
}
