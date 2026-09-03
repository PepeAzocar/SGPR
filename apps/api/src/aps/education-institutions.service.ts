import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateEducationInstitutionDto } from './dto/create-education-institution.dto.js';
import { UpdateEducationInstitutionDto } from './dto/update-education-institution.dto.js';
import { rethrowAsHttpError, rethrowDeleteConflict } from '../common/utils/prisma-error.util.js';

const include = { institutionType: true, country: true };

@Injectable()
export class EducationInstitutionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEducationInstitutionDto) {
    try {
      return await this.prisma.educationInstitution.create({ data: dto, include });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  findAll() {
    return this.prisma.educationInstitution.findMany({ include, orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const institution = await this.prisma.educationInstitution.findUnique({ where: { id }, include });
    if (!institution) throw new NotFoundException('Institución académica no encontrada');
    return institution;
  }

  async update(id: string, dto: UpdateEducationInstitutionDto) {
    await this.findOne(id);
    try {
      return await this.prisma.educationInstitution.update({ where: { id }, data: dto, include });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.educationInstitution.delete({ where: { id } });
    } catch (err) {
      rethrowDeleteConflict(err, 'No se puede eliminar: la institución tiene formación o cursos registrados');
    }
  }
}
