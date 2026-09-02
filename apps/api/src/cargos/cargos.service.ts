import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCargoDto } from './dto/create-cargo.dto.js';
import { UpdateCargoDto } from './dto/update-cargo.dto.js';
import { normalizeEffectiveDates } from '../common/utils/date.util.js';

@Injectable()
export class CargosService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateCargoDto, actingUserEmail: string) {
    return this.prisma.cargo.create({
      data: { ...normalizeEffectiveDates(dto), createdBy: actingUserEmail, updatedBy: actingUserEmail },
    });
  }

  findAll() {
    return this.prisma.cargo.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const entity = await this.prisma.cargo.findUnique({ where: { id } });
    if (!entity) throw new NotFoundException('Cargo no encontrado');
    return entity;
  }

  async update(id: string, dto: UpdateCargoDto, actingUserEmail: string) {
    await this.findOne(id);
    return this.prisma.cargo.update({
      where: { id },
      data: { ...normalizeEffectiveDates(dto), updatedBy: actingUserEmail },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.cargo.delete({ where: { id } });
    } catch {
      throw new ConflictException('No se puede eliminar: tiene posiciones asociadas');
    }
  }
}
