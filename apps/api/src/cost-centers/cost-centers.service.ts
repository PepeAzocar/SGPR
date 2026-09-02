import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCostCenterDto } from './dto/create-cost-center.dto.js';
import { UpdateCostCenterDto } from './dto/update-cost-center.dto.js';
import { normalizeEffectiveDates } from '../common/utils/date.util.js';
import { rethrowAsHttpError } from '../common/utils/prisma-error.util.js';

@Injectable()
export class CostCentersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCostCenterDto, actingUserEmail: string) {
    try {
      return await this.prisma.costCenter.create({
        data: { ...normalizeEffectiveDates(dto), createdBy: actingUserEmail, updatedBy: actingUserEmail },
      });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  findAll() {
    return this.prisma.costCenter.findMany({
      include: { legalEntity: true, parent: true, manager: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const entity = await this.prisma.costCenter.findUnique({
      where: { id },
      include: { legalEntity: true, parent: true, children: true, manager: true },
    });
    if (!entity) throw new NotFoundException('Centro de costo no encontrado');
    return entity;
  }

  async update(id: string, dto: UpdateCostCenterDto, actingUserEmail: string) {
    await this.findOne(id);
    if (dto.parentId === id) {
      throw new BadRequestException('Un centro de costo no puede ser su propio centro de costo padre');
    }
    try {
      return await this.prisma.costCenter.update({
        where: { id },
        data: { ...normalizeEffectiveDates(dto), updatedBy: actingUserEmail },
      });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.costCenter.delete({ where: { id } });
    } catch {
      throw new ConflictException('No se puede eliminar: tiene centros de costo, departamentos o posiciones asociadas');
    }
  }
}
