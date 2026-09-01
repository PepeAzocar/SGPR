import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateHealthInstitutionDto } from './dto/create-health-institution.dto.js';
import { UpdateHealthInstitutionDto } from './dto/update-health-institution.dto.js';

@Injectable()
export class HealthInstitutionsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateHealthInstitutionDto) {
    return this.prisma.healthInstitution.create({ data: dto });
  }

  findAll() {
    return this.prisma.healthInstitution.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const institution = await this.prisma.healthInstitution.findUnique({ where: { id } });
    if (!institution) throw new NotFoundException('Institución de salud no encontrada');
    return institution;
  }

  async update(id: string, dto: UpdateHealthInstitutionDto) {
    await this.findOne(id);
    return this.prisma.healthInstitution.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.healthInstitution.delete({ where: { id } });
  }
}
