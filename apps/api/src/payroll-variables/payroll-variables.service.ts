import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePayrollVariableDto } from './dto/create-payroll-variable.dto.js';
import { UpdatePayrollVariableDto } from './dto/update-payroll-variable.dto.js';
import { rethrowAsHttpError, rethrowDeleteConflict } from '../common/utils/prisma-error.util.js';

@Injectable()
export class PayrollVariablesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePayrollVariableDto) {
    try {
      return await this.prisma.payrollVariable.create({ data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  findAll() {
    return this.prisma.payrollVariable.findMany({ orderBy: { code: 'asc' } });
  }

  async findOne(id: string) {
    const variable = await this.prisma.payrollVariable.findUnique({ where: { id } });
    if (!variable) throw new NotFoundException('Variable no encontrada');
    return variable;
  }

  async update(id: string, dto: UpdatePayrollVariableDto) {
    await this.findOne(id);
    try {
      return await this.prisma.payrollVariable.update({ where: { id }, data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.payrollVariable.delete({ where: { id } });
    } catch (err) {
      rethrowDeleteConflict(err, 'No se puede eliminar: la variable está en uso');
    }
  }
}
