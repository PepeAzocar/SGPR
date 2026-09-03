import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateApsTrainingEvaluationLevelDto } from './dto/create-aps-training-evaluation-level.dto.js';
import { UpdateApsTrainingEvaluationLevelDto } from './dto/update-aps-training-evaluation-level.dto.js';
import { rethrowAsHttpError, rethrowDeleteConflict } from '../common/utils/prisma-error.util.js';

@Injectable()
export class ApsTrainingEvaluationLevelsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateApsTrainingEvaluationLevelDto) {
    try {
      return await this.prisma.apsTrainingEvaluationLevel.create({ data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  findAll() {
    return this.prisma.apsTrainingEvaluationLevel.findMany({ orderBy: { minimumGrade: 'asc' } });
  }

  async findOne(id: string) {
    const level = await this.prisma.apsTrainingEvaluationLevel.findUnique({ where: { id } });
    if (!level) throw new NotFoundException('Nivel de evaluación no encontrado');
    return level;
  }

  async update(id: string, dto: UpdateApsTrainingEvaluationLevelDto) {
    await this.findOne(id);
    try {
      return await this.prisma.apsTrainingEvaluationLevel.update({ where: { id }, data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.apsTrainingEvaluationLevel.delete({ where: { id } });
    } catch (err) {
      rethrowDeleteConflict(err, 'No se puede eliminar: el nivel de evaluación está en uso');
    }
  }
}
