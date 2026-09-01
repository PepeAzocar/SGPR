import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateEmployeePensionSavingDto } from './dto/create-employee-pension-saving.dto.js';
import { UpdateEmployeePensionSavingDto } from './dto/update-employee-pension-saving.dto.js';

@Injectable()
export class EmployeePensionSavingsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEmployeePensionSavingDto) {
    return this.prisma.$transaction(async (tx) => {
      // Solo cierra la vigencia anterior del MISMO tipo de producto: un empleado
      // puede tener varios productos voluntarios distintos activos a la vez
      // (ej. APV y Cuenta 2 simultáneamente).
      await tx.employeePensionSaving.updateMany({
        where: {
          employeeId: dto.employeeId,
          productType: dto.productType,
          status: 'ACTIVE',
          effectiveTo: null,
        },
        data: { status: 'FINISHED', effectiveTo: dto.effectiveFrom },
      });

      return tx.employeePensionSaving.create({ data: dto });
    });
  }

  findAll(employeeId?: string) {
    return this.prisma.employeePensionSaving.findMany({
      where: { employeeId },
      include: { institution: true },
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.employeePensionSaving.findUnique({
      where: { id },
      include: { institution: true },
    });
    if (!record) throw new NotFoundException('Producto de ahorro previsional no encontrado');
    return record;
  }

  async update(id: string, dto: UpdateEmployeePensionSavingDto) {
    await this.findOne(id);
    return this.prisma.employeePensionSaving.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.employeePensionSaving.delete({ where: { id } });
  }
}
