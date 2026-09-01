import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LeavesService } from './leaves.service.js';
import { CreateLeafDto } from './dto/create-leaf.dto.js';
import { UpdateLeafDto } from './dto/update-leaf.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@UseGuards(RolesGuard)
@Roles('ADMIN', 'RRHH')
@Controller('leaves')
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  @Post()
  create(@Body() dto: CreateLeafDto) {
    return this.leavesService.create(dto);
  }

  @Get()
  findAll() {
    return this.leavesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leavesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLeafDto) {
    return this.leavesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leavesService.remove(id);
  }
}
