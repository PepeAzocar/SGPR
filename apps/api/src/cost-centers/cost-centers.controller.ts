import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CostCentersService } from './cost-centers.service.js';
import { CreateCostCenterDto } from './dto/create-cost-center.dto.js';
import { UpdateCostCenterDto } from './dto/update-cost-center.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/jwt.strategy.js';

@UseGuards(RolesGuard)
@Roles('ADMIN')
@Controller('cost-centers')
export class CostCentersController {
  constructor(private readonly costCentersService: CostCentersService) {}

  @Post()
  create(@Body() dto: CreateCostCenterDto, @CurrentUser() user: AuthenticatedUser) {
    return this.costCentersService.create(dto, user.email);
  }

  @Get()
  findAll() {
    return this.costCentersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.costCentersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCostCenterDto, @CurrentUser() user: AuthenticatedUser) {
    return this.costCentersService.update(id, dto, user.email);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.costCentersService.remove(id);
  }
}
