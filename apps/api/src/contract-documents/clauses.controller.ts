import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ClausesService } from './clauses.service.js';
import { CreateClauseDto } from './dto/create-clause.dto.js';
import { UpdateClauseDto } from './dto/update-clause.dto.js';
import { CreateClauseVersionDto } from './dto/create-clause-version.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/jwt.strategy.js';

@UseGuards(RolesGuard)
@Roles('ADMIN', 'RRHH')
@Controller('clauses')
export class ClausesController {
  constructor(private readonly service: ClausesService) {}

  @Post()
  create(@Body() dto: CreateClauseDto, @CurrentUser() user: AuthenticatedUser) {
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
  update(@Param('id') id: string, @Body() dto: UpdateClauseDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/versions')
  createVersion(@Param('id') id: string, @Body() dto: CreateClauseVersionDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.createVersion(id, dto, user.email);
  }

  @Patch('versions/:versionId')
  updateVersion(@Param('versionId') versionId: string, @Body() dto: CreateClauseVersionDto) {
    return this.service.updateVersion(versionId, dto);
  }

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
