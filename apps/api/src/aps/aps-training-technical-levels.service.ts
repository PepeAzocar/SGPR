import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateApsTrainingTechnicalLevelDto } from './dto/create-aps-training-technical-level.dto.js';
import { UpdateApsTrainingTechnicalLevelDto } from './dto/update-aps-training-technical-level.dto.js';
import { rethrowAsHttpError, rethrowDeleteConflict } from '../common/utils/prisma-error.util.js';

@Injectable()
export class ApsTrainingTechnicalLevelsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateApsTrainingTechnicalLevelDto) {
    try {
      return await this.prisma.apsTrainingTechnicalLevel.create({ data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  findAll() {
    return this.prisma.apsTrainingTechnicalLevel.findMany({ orderBy: { factor: 'asc' } });
  }

  async findOne(id: string) {
    const level = await this.prisma.apsTrainingTechnicalLevel.findUnique({ where: { id } });
    if (!level) throw new NotFoundException('Nivel técnico no encontrado');
    return level;
  }

  async update(id: string, dto: UpdateApsTrainingTechnicalLevelDto) {
    await this.findOne(id);
    try {
      return await this.prisma.apsTrainingTechnicalLevel.update({ where: { id }, data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.apsTrainingTechnicalLevel.delete({ where: { id } });
    } catch (err) {
      rethrowDeleteConflict(err, 'No se puede eliminar: el nivel técnico está en uso');
    }
  }
}
