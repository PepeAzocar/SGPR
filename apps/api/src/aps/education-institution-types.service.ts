import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateEducationInstitutionTypeDto } from './dto/create-education-institution-type.dto.js';
import { UpdateEducationInstitutionTypeDto } from './dto/update-education-institution-type.dto.js';
import { rethrowAsHttpError, rethrowDeleteConflict } from '../common/utils/prisma-error.util.js';

@Injectable()
export class EducationInstitutionTypesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEducationInstitutionTypeDto) {
    try {
      return await this.prisma.educationInstitutionType.create({ data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  findAll() {
    return this.prisma.educationInstitutionType.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const type = await this.prisma.educationInstitutionType.findUnique({ where: { id } });
    if (!type) throw new NotFoundException('Tipo de institución no encontrado');
    return type;
  }

  async update(id: string, dto: UpdateEducationInstitutionTypeDto) {
    await this.findOne(id);
    try {
      return await this.prisma.educationInstitutionType.update({ where: { id }, data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.educationInstitutionType.delete({ where: { id } });
    } catch (err) {
      rethrowDeleteConflict(err, 'No se puede eliminar: el tipo de institución está en uso');
    }
  }
}
