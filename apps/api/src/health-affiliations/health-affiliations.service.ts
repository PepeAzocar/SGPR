import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateHealthAffiliationDto } from './dto/create-health-affiliation.dto.js';
import { UpdateHealthAffiliationDto } from './dto/update-health-affiliation.dto.js';

@Injectable()
export class HealthAffiliationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateHealthAffiliationDto) {
    return this.prisma.$transaction(async (tx) => {
      await tx.healthAffiliation.updateMany({
        where: { employeeId: dto.employeeId, status: 'ACTIVE', effectiveTo: null },
        data: { status: 'FINISHED', effectiveTo: dto.effectiveFrom },
      });

      return tx.healthAffiliation.create({ data: dto });
    });
  }

  findAll(employeeId?: string) {
    return this.prisma.healthAffiliation.findMany({
      where: { employeeId },
      include: { healthInstitution: true },
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  async findOne(id: string) {
    const record = await this.prisma.healthAffiliation.findUnique({
      where: { id },
      include: { healthInstitution: true },
    });
    if (!record) throw new NotFoundException('Afiliación de salud no encontrada');
    return record;
  }

  async update(id: string, dto: UpdateHealthAffiliationDto) {
    await this.findOne(id);
    return this.prisma.healthAffiliation.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.healthAffiliation.delete({ where: { id } });
  }
}
