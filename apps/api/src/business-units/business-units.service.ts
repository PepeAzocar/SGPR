import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateBusinessUnitDto } from './dto/create-business-unit.dto.js';
import { UpdateBusinessUnitDto } from './dto/update-business-unit.dto.js';
import { normalizeEffectiveDates } from '../common/utils/date.util.js';
import { rethrowAsHttpError } from '../common/utils/prisma-error.util.js';

@Injectable()
export class BusinessUnitsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateBusinessUnitDto, actingUserEmail: string) {
    try {
      return await this.prisma.businessUnit.create({
        data: { ...normalizeEffectiveDates(dto), createdBy: actingUserEmail, updatedBy: actingUserEmail },
      });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  findAll() {
    return this.prisma.businessUnit.findMany({
      include: { legalEntity: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const entity = await this.prisma.businessUnit.findUnique({
      where: { id },
      include: { legalEntity: true },
    });
    if (!entity) throw new NotFoundException('Unidad de negocio no encontrada');
    return entity;
  }

  async update(id: string, dto: UpdateBusinessUnitDto, actingUserEmail: string) {
    await this.findOne(id);
    try {
      return await this.prisma.businessUnit.update({
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
      return await this.prisma.businessUnit.delete({ where: { id } });
    } catch {
      throw new ConflictException('No se puede eliminar: tiene divisiones asociadas');
    }
  }
}
