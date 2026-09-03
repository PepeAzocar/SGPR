import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateApsProfessionDto } from './dto/create-aps-profession.dto.js';
import { UpdateApsProfessionDto } from './dto/update-aps-profession.dto.js';
import { rethrowAsHttpError, rethrowDeleteConflict } from '../common/utils/prisma-error.util.js';

const include = { category: true };

@Injectable()
export class ApsProfessionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateApsProfessionDto) {
    try {
      return await this.prisma.apsProfession.create({ data: dto, include });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  findAll() {
    return this.prisma.apsProfession.findMany({ include, orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const profession = await this.prisma.apsProfession.findUnique({ where: { id }, include });
    if (!profession) throw new NotFoundException('Profesión no encontrada');
    return profession;
  }

  async update(id: string, dto: UpdateApsProfessionDto) {
    await this.findOne(id);
    try {
      return await this.prisma.apsProfession.update({ where: { id }, data: dto, include });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.apsProfession.delete({ where: { id } });
    } catch (err) {
      rethrowDeleteConflict(err, 'No se puede eliminar: la profesión está en uso');
    }
  }
}
