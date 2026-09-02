import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMutualityDto } from './dto/create-mutuality.dto.js';
import { UpdateMutualityDto } from './dto/update-mutuality.dto.js';
import { rethrowAsHttpError, rethrowDeleteConflict } from '../common/utils/prisma-error.util.js';

@Injectable()
export class MutualitiesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMutualityDto) {
    try {
      return await this.prisma.mutuality.create({ data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  findAll() {
    return this.prisma.mutuality.findMany({ orderBy: { legalName: 'asc' } });
  }

  async findOne(id: string) {
    const mutuality = await this.prisma.mutuality.findUnique({ where: { id } });
    if (!mutuality) throw new NotFoundException('Mutualidad no encontrada');
    return mutuality;
  }

  async update(id: string, dto: UpdateMutualityDto) {
    await this.findOne(id);
    try {
      return await this.prisma.mutuality.update({ where: { id }, data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.mutuality.delete({ where: { id } });
    } catch (err) {
      rethrowDeleteConflict(err, 'No se puede eliminar: la mutualidad tiene registros asociados');
    }
  }
}
