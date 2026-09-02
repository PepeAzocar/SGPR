import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateAfpEntityDto } from './dto/create-afp-entity.dto.js';
import { UpdateAfpEntityDto } from './dto/update-afp-entity.dto.js';
import { rethrowAsHttpError, rethrowDeleteConflict } from '../common/utils/prisma-error.util.js';

@Injectable()
export class AfpEntitiesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAfpEntityDto) {
    try {
      return await this.prisma.afpEntity.create({ data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  findAll() {
    return this.prisma.afpEntity.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const afp = await this.prisma.afpEntity.findUnique({ where: { id } });
    if (!afp) throw new NotFoundException('AFP no encontrada');
    return afp;
  }

  async update(id: string, dto: UpdateAfpEntityDto) {
    await this.findOne(id);
    try {
      return await this.prisma.afpEntity.update({ where: { id }, data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.afpEntity.delete({ where: { id } });
    } catch (err) {
      rethrowDeleteConflict(err, 'No se puede eliminar: hay trabajadores afiliados o con ahorro previsional en esta AFP');
    }
  }
}
