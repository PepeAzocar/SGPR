import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCcafDto } from './dto/create-ccaf.dto.js';
import { UpdateCcafDto } from './dto/update-ccaf.dto.js';
import { rethrowAsHttpError, rethrowDeleteConflict } from '../common/utils/prisma-error.util.js';

@Injectable()
export class CcafsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCcafDto) {
    try {
      return await this.prisma.ccaf.create({ data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  findAll() {
    return this.prisma.ccaf.findMany({ orderBy: { legalName: 'asc' } });
  }

  async findOne(id: string) {
    const ccaf = await this.prisma.ccaf.findUnique({ where: { id } });
    if (!ccaf) throw new NotFoundException('Caja de compensación no encontrada');
    return ccaf;
  }

  async update(id: string, dto: UpdateCcafDto) {
    await this.findOne(id);
    try {
      return await this.prisma.ccaf.update({ where: { id }, data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.ccaf.delete({ where: { id } });
    } catch (err) {
      rethrowDeleteConflict(err, 'No se puede eliminar: la caja de compensación tiene registros asociados');
    }
  }
}
