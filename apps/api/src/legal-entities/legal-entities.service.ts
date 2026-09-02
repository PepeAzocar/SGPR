import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateLegalEntityDto } from './dto/create-legal-entity.dto.js';
import { UpdateLegalEntityDto } from './dto/update-legal-entity.dto.js';
import { normalizeEffectiveDates } from '../common/utils/date.util.js';

@Injectable()
export class LegalEntitiesService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateLegalEntityDto, actingUserEmail: string) {
    return this.prisma.legalEntity.create({
      data: { ...normalizeEffectiveDates(dto), createdBy: actingUserEmail, updatedBy: actingUserEmail },
    });
  }

  findAll() {
    return this.prisma.legalEntity.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const entity = await this.prisma.legalEntity.findUnique({ where: { id } });
    if (!entity) throw new NotFoundException('Entidad legal no encontrada');
    return entity;
  }

  async update(id: string, dto: UpdateLegalEntityDto, actingUserEmail: string) {
    await this.findOne(id);
    return this.prisma.legalEntity.update({
      where: { id },
      data: { ...normalizeEffectiveDates(dto), updatedBy: actingUserEmail },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.legalEntity.delete({ where: { id } });
    } catch {
      throw new ConflictException('No se puede eliminar: tiene unidades de negocio o centros de costo asociados');
    }
  }
}
