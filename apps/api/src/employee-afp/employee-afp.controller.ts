import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EmployeeAfpService } from './employee-afp.service.js';
import { CreateEmployeeAfpDto } from './dto/create-employee-afp.dto.js';
import { UpdateEmployeeAfpDto } from './dto/update-employee-afp.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@UseGuards(RolesGuard)
@Roles('ADMIN', 'RRHH')
@Controller('employee-afp')
export class EmployeeAfpController {
  constructor(private readonly employeeAfpService: EmployeeAfpService) {}

  @Post()
  create(@Body() dto: CreateEmployeeAfpDto) {
    return this.employeeAfpService.create(dto);
  }

  @Get()
  findAll(@Query('employeeId') employeeId?: string) {
    return this.employeeAfpService.findAll(employeeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeeAfpService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEmployeeAfpDto) {
    return this.employeeAfpService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeeAfpService.remove(id);
  }
}
