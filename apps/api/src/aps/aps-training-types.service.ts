import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateApsTrainingTypeDto } from './dto/create-aps-training-type.dto.js';
import { UpdateApsTrainingTypeDto } from './dto/update-aps-training-type.dto.js';
import { rethrowAsHttpError, rethrowDeleteConflict } from '../common/utils/prisma-error.util.js';

@Injectable()
export class ApsTrainingTypesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateApsTrainingTypeDto) {
    try {
      return await this.prisma.apsTrainingType.create({ data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  findAll() {
    return this.prisma.apsTrainingType.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const type = await this.prisma.apsTrainingType.findUnique({ where: { id } });
    if (!type) throw new NotFoundException('Tipo de capacitación no encontrado');
    return type;
  }

  async update(id: string, dto: UpdateApsTrainingTypeDto) {
    await this.findOne(id);
    try {
      return await this.prisma.apsTrainingType.update({ where: { id }, data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.apsTrainingType.delete({ where: { id } });
    } catch (err) {
      rethrowDeleteConflict(err, 'No se puede eliminar: el tipo de capacitación está en uso');
    }
  }
}
