import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CcafsService } from './ccafs.service.js';
import { CreateCcafDto } from './dto/create-ccaf.dto.js';
import { UpdateCcafDto } from './dto/update-ccaf.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@UseGuards(RolesGuard)
@Controller('ccafs')
export class CcafsController {
  constructor(private readonly ccafsService: CcafsService) {}

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateCcafDto) {
    return this.ccafsService.create(dto);
  }

  @Roles('ADMIN', 'RRHH')
  @Get()
  findAll() {
    return this.ccafsService.findAll();
  }

  @Roles('ADMIN', 'RRHH')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ccafsService.findOne(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCcafDto) {
    return this.ccafsService.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ccafsService.remove(id);
  }
}
