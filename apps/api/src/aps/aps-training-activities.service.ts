import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateApsTrainingActivityDto } from './dto/create-aps-training-activity.dto.js';
import { UpdateApsTrainingActivityDto } from './dto/update-aps-training-activity.dto.js';
import { rethrowAsHttpError, rethrowDeleteConflict } from '../common/utils/prisma-error.util.js';

const include = { trainingType: true, institution: true, technicalLevel: true };

@Injectable()
export class ApsTrainingActivitiesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateApsTrainingActivityDto) {
    try {
      return await this.prisma.apsTrainingActivity.create({ data: dto, include });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  findAll() {
    return this.prisma.apsTrainingActivity.findMany({ include, orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const activity = await this.prisma.apsTrainingActivity.findUnique({ where: { id }, include });
    if (!activity) throw new NotFoundException('Curso no encontrado');
    return activity;
  }

  async update(id: string, dto: UpdateApsTrainingActivityDto) {
    await this.findOne(id);
    try {
      return await this.prisma.apsTrainingActivity.update({ where: { id }, data: dto, include });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.apsTrainingActivity.delete({ where: { id } });
    } catch (err) {
      rethrowDeleteConflict(err, 'No se puede eliminar: el curso tiene funcionarios inscritos');
    }
  }
}
