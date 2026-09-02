import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCommuneDto } from './dto/create-commune.dto.js';
import { UpdateCommuneDto } from './dto/update-commune.dto.js';
import { rethrowAsHttpError, rethrowDeleteConflict } from '../common/utils/prisma-error.util.js';

function withDisplayName<T extends { name: string; region: { name: string; country: { name: string } } }>(commune: T) {
  return { ...commune, displayName: `${commune.name} — ${commune.region.name}, ${commune.region.country.name}` };
}

@Injectable()
export class CommunesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCommuneDto) {
    try {
      return await this.prisma.commune.create({ data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async findAll(regionId?: string) {
    const communes = await this.prisma.commune.findMany({
      where: regionId ? { regionId } : undefined,
      include: { region: { include: { country: true } } },
      orderBy: { name: 'asc' },
    });
    return communes.map(withDisplayName);
  }

  async findOne(id: string) {
    const commune = await this.prisma.commune.findUnique({
      where: { id },
      include: { region: { include: { country: true } } },
    });
    if (!commune) throw new NotFoundException('Comuna no encontrada');
    return withDisplayName(commune);
  }

  async update(id: string, dto: UpdateCommuneDto) {
    await this.findOne(id);
    try {
      return await this.prisma.commune.update({ where: { id }, data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.commune.delete({ where: { id } });
    } catch (err) {
      rethrowDeleteConflict(err, 'No se puede eliminar: la comuna tiene registros asociados');
    }
  }
}
