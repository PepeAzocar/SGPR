import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { DivisionsService } from './divisions.service.js';
import { CreateDivisionDto } from './dto/create-division.dto.js';
import { UpdateDivisionDto } from './dto/update-division.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/jwt.strategy.js';

@UseGuards(RolesGuard)
@Roles('ADMIN')
@Controller('divisions')
export class DivisionsController {
  constructor(private readonly divisionsService: DivisionsService) {}

  @Post()
  create(@Body() dto: CreateDivisionDto, @CurrentUser() user: AuthenticatedUser) {
    return this.divisionsService.create(dto, user.email);
  }

  @Get()
  findAll() {
    return this.divisionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.divisionsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDivisionDto, @CurrentUser() user: AuthenticatedUser) {
    return this.divisionsService.update(id, dto, user.email);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.divisionsService.remove(id);
  }
}
