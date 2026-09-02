import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { EmployeeEventsService } from './employee-events.service.js';
import { CreateEmployeeEventDto } from './dto/create-employee-event.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/jwt.strategy.js';

@UseGuards(RolesGuard)
@Roles('ADMIN', 'RRHH')
@Controller('employee-events')
export class EmployeeEventsController {
  constructor(private readonly employeeEventsService: EmployeeEventsService) {}

  @Post()
  create(@Body() dto: CreateEmployeeEventDto, @CurrentUser() user: AuthenticatedUser) {
    return this.employeeEventsService.create(dto, user.email);
  }

  @Get()
  findAll(
    @Query('employeeId') employeeId?: string,
    @Query('year') year?: string,
    @Query('month') month?: string,
    @Query('eventTypeId') eventTypeId?: string,
    @Query('status') status?: string,
    @Query('payrollRelevant') payrollRelevant?: string,
    @Query('retroactive') retroactive?: string,
  ) {
    return this.employeeEventsService.findAll({
      employeeId,
      year: year ? Number(year) : undefined,
      month: month ? Number(month) : undefined,
      eventTypeId,
      status,
      payrollRelevant: payrollRelevant != null ? payrollRelevant === 'true' : undefined,
      retroactive: retroactive != null ? retroactive === 'true' : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeeEventsService.findOne(id);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.employeeEventsService.cancel(id);
  }
}
