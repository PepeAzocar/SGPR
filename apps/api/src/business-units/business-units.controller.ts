import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { BusinessUnitsService } from './business-units.service.js';
import { CreateBusinessUnitDto } from './dto/create-business-unit.dto.js';
import { UpdateBusinessUnitDto } from './dto/update-business-unit.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/jwt.strategy.js';

@UseGuards(RolesGuard)
@Roles('ADMIN')
@Controller('business-units')
export class BusinessUnitsController {
  constructor(private readonly businessUnitsService: BusinessUnitsService) {}

  @Post()
  create(@Body() dto: CreateBusinessUnitDto, @CurrentUser() user: AuthenticatedUser) {
    return this.businessUnitsService.create(dto, user.email);
  }

  @Get()
  findAll() {
    return this.businessUnitsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.businessUnitsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBusinessUnitDto, @CurrentUser() user: AuthenticatedUser) {
    return this.businessUnitsService.update(id, dto, user.email);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.businessUnitsService.remove(id);
  }
}
