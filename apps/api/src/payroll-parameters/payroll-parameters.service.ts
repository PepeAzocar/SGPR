import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePayrollParameterDto } from './dto/create-payroll-parameter.dto.js';
import { UpdatePayrollParameterDto } from './dto/update-payroll-parameter.dto.js';
import { AddPayrollParameterValueDto } from './dto/add-payroll-parameter-value.dto.js';
import { rethrowAsHttpError, rethrowDeleteConflict } from '../common/utils/prisma-error.util.js';

const include = { values: { orderBy: { effectiveFrom: 'desc' as const } } };

@Injectable()
export class PayrollParametersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePayrollParameterDto) {
    try {
      return await this.prisma.payrollParameter.create({ data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  findAll() {
    return this.prisma.payrollParameter.findMany({ include, orderBy: { code: 'asc' } });
  }

  async findOne(id: string) {
    const parameter = await this.prisma.payrollParameter.findUnique({ where: { id }, include });
    if (!parameter) throw new NotFoundException('Parámetro no encontrado');
    return parameter;
  }

  async update(id: string, dto: UpdatePayrollParameterDto) {
    await this.findOne(id);
    try {
      return await this.prisma.payrollParameter.update({ where: { id }, data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.payrollParameter.delete({ where: { id } });
    } catch (err) {
      rethrowDeleteConflict(err, 'No se puede eliminar: el parámetro tiene valores registrados');
    }
  }

  /**
   * Igual que EmployeeAfp/EmployeeBankAccount: no se sobrescribe el valor
   * vigente, se cierra su vigencia en la fecha en que empieza a regir el
   * nuevo. Así se puede cambiar un porcentaje sin tocar las fórmulas que lo
   * usan y sin perder el valor histórico.
   */
  async addValue(parameterId: string, dto: AddPayrollParameterValueDto) {
    await this.findOne(parameterId);
    return this.prisma.$transaction(async (tx) => {
      await tx.payrollParameterValue.updateMany({
        where: { parameterId, effectiveTo: null },
        data: { effectiveTo: dto.effectiveFrom },
      });
      return tx.payrollParameterValue.create({ data: { ...dto, parameterId } });
    });
  }
}
