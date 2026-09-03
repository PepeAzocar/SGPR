import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateApsTrainingDurationRuleDto } from './dto/create-aps-training-duration-rule.dto.js';
import { UpdateApsTrainingDurationRuleDto } from './dto/update-aps-training-duration-rule.dto.js';
import { rethrowAsHttpError, rethrowDeleteConflict } from '../common/utils/prisma-error.util.js';

@Injectable()
export class ApsTrainingDurationRulesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateApsTrainingDurationRuleDto) {
    try {
      return await this.prisma.apsTrainingDurationRule.create({ data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  findAll() {
    return this.prisma.apsTrainingDurationRule.findMany({ orderBy: { minimumHours: 'asc' } });
  }

  async findOne(id: string) {
    const rule = await this.prisma.apsTrainingDurationRule.findUnique({ where: { id } });
    if (!rule) throw new NotFoundException('Tramo de horas no encontrado');
    return rule;
  }

  async update(id: string, dto: UpdateApsTrainingDurationRuleDto) {
    await this.findOne(id);
    try {
      return await this.prisma.apsTrainingDurationRule.update({ where: { id }, data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.apsTrainingDurationRule.delete({ where: { id } });
  }
}
