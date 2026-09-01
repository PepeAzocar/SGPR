import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateEmployeeAfpDto } from './dto/create-employee-afp.dto.js';
import { UpdateEmployeeAfpDto } from './dto/update-employee-afp.dto.js';

@Injectable()
export class EmployeeAfpService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEmployeeAfpDto) {
    return this.prisma.$transaction(async (tx) => {
      // Cierra la afiliación vigente anterior (si existe) en la fecha en que
      // comienza a regir la nueva, en vez de sobrescribirla.
      await tx.employeeAfp.updateMany({
        where: { employeeId: dto.employeeId, status: 'ACTIVE', effectiveTo: null },
        data: { status: 'FINISHED', effectiveTo: dto.effectiveFrom },
      });

      return tx.employeeAfp.create({ data: dto });
    });
  }

  findAll(employeeId?: string) {
    return this.prisma.employeeAfp.findMany({
      where: { employeeId },
      include: { afp: true },
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.employeeAfp.findUnique({ where: { id }, include: { afp: true } });
    if (!record) throw new NotFoundException('Afiliación AFP no encontrada');
    return record;
  }

  async update(id: string, dto: UpdateEmployeeAfpDto) {
    await this.findOne(id);
    return this.prisma.employeeAfp.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.employeeAfp.delete({ where: { id } });
  }
}
