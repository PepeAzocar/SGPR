import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateEconomicIndicatorDto } from './dto/create-economic-indicator.dto.js';
import { UpdateEconomicIndicatorDto } from './dto/update-economic-indicator.dto.js';

@Injectable()
export class EconomicIndicatorsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateEconomicIndicatorDto) {
    return this.prisma.economicIndicator.create({ data: dto });
  }

  findAll() {
    return this.prisma.economicIndicator.findMany({ orderBy: { period: 'desc' } });
  }

  async findOne(id: string) {
    const indicator = await this.prisma.economicIndicator.findUnique({ where: { id } });
    if (!indicator) throw new NotFoundException('Indicador económico no encontrado');
    return indicator;
  }

  async update(id: string, dto: UpdateEconomicIndicatorDto) {
    await this.findOne(id);
    return this.prisma.economicIndicator.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.economicIndicator.delete({ where: { id } });
  }
}
