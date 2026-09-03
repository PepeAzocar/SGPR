import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { DocumentTokensService } from './document-tokens.service.js';
import { CreateDocumentTokenDto } from './dto/create-document-token.dto.js';
import { UpdateDocumentTokenDto } from './dto/update-document-token.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@UseGuards(RolesGuard)
@Roles('ADMIN', 'RRHH')
@Controller('document-tokens')
export class DocumentTokensController {
  constructor(private readonly service: DocumentTokensService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // El catálogo de tokens sólo lo mantiene ADMIN: define qué datos puede
  // exponer el motor documental a plantillas y cláusulas.
  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateDocumentTokenDto) {
    return this.service.create(dto);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDocumentTokenDto) {
    return this.service.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
