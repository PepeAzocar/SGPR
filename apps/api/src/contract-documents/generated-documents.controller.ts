import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { GeneratedDocumentsService } from './generated-documents.service.js';
import { GenerateDocumentDto } from './dto/generate-document.dto.js';
import { CancelDocumentDto } from './dto/cancel-document.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/jwt.strategy.js';

@UseGuards(RolesGuard)
@Roles('ADMIN', 'RRHH')
@Controller('generated-documents')
export class GeneratedDocumentsController {
  constructor(private readonly service: GeneratedDocumentsService) {}

  @Post('preview')
  preview(@Body() dto: GenerateDocumentDto) {
    return this.service.preview(dto);
  }

  @Post('generate')
  generate(@Body() dto: GenerateDocumentDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.generate(dto, user.email);
  }

  @Get()
  findAll(
    @Query('employeeId') employeeId?: string,
    @Query('matrixId') matrixId?: string,
    @Query('status') status?: string,
  ) {
    return this.service.findAll({ employeeId, matrixId, status });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string, @Body() dto: CancelDocumentDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.cancel(id, dto, user.email);
  }
}
