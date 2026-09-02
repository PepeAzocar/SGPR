import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateLaborRegimeDto } from './dto/create-labor-regime.dto.js';
import { UpdateLaborRegimeDto } from './dto/update-labor-regime.dto.js';
import { rethrowAsHttpError, rethrowDeleteConflict } from '../common/utils/prisma-error.util.js';

@Injectable()
export class LaborRegimesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLaborRegimeDto) {
    try {
      return await this.prisma.laborRegime.create({ data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  findAll() {
    return this.prisma.laborRegime.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const regime = await this.prisma.laborRegime.findUnique({ where: { id } });
    if (!regime) throw new NotFoundException('Régimen jurídico no encontrado');
    return regime;
  }

  async update(id: string, dto: UpdateLaborRegimeDto) {
    await this.findOne(id);
    try {
      return await this.prisma.laborRegime.update({ where: { id }, data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.laborRegime.delete({ where: { id } });
    } catch (err) {
      rethrowDeleteConflict(err, 'No se puede eliminar: tiene tipos de contrato o contratos asociados');
    }
  }
}
