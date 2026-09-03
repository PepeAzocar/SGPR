import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateApsLaborInstitutionDto } from './dto/create-aps-labor-institution.dto.js';
import { UpdateApsLaborInstitutionDto } from './dto/update-aps-labor-institution.dto.js';
import { rethrowAsHttpError, rethrowDeleteConflict } from '../common/utils/prisma-error.util.js';

@Injectable()
export class ApsLaborInstitutionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateApsLaborInstitutionDto) {
    try {
      return await this.prisma.apsLaborInstitution.create({ data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  findAll() {
    return this.prisma.apsLaborInstitution.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const institution = await this.prisma.apsLaborInstitution.findUnique({ where: { id } });
    if (!institution) throw new NotFoundException('Institución laboral no encontrada');
    return institution;
  }

  async update(id: string, dto: UpdateApsLaborInstitutionDto) {
    await this.findOne(id);
    try {
      return await this.prisma.apsLaborInstitution.update({ where: { id }, data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.apsLaborInstitution.delete({ where: { id } });
    } catch (err) {
      rethrowDeleteConflict(err, 'No se puede eliminar: la institución tiene servicios reconocidos registrados');
    }
  }
}
