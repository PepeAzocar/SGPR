import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateHealthInstitutionDto } from './dto/create-health-institution.dto.js';
import { UpdateHealthInstitutionDto } from './dto/update-health-institution.dto.js';
import { rethrowAsHttpError, rethrowDeleteConflict } from '../common/utils/prisma-error.util.js';

@Injectable()
export class HealthInstitutionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateHealthInstitutionDto) {
    try {
      return await this.prisma.healthInstitution.create({ data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
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
    try {
      return await this.prisma.healthInstitution.update({ where: { id }, data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.healthInstitution.delete({ where: { id } });
    } catch (err) {
      rethrowDeleteConflict(err, 'No se puede eliminar: hay trabajadores afiliados a esta institución de salud');
    }
  }
}
