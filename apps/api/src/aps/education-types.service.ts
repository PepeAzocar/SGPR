import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateEducationTypeDto } from './dto/create-education-type.dto.js';
import { UpdateEducationTypeDto } from './dto/update-education-type.dto.js';
import { rethrowAsHttpError, rethrowDeleteConflict } from '../common/utils/prisma-error.util.js';

@Injectable()
export class EducationTypesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEducationTypeDto) {
    try {
      return await this.prisma.educationType.create({ data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  findAll() {
    return this.prisma.educationType.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const type = await this.prisma.educationType.findUnique({ where: { id } });
    if (!type) throw new NotFoundException('Tipo de formación no encontrado');
    return type;
  }

  async update(id: string, dto: UpdateEducationTypeDto) {
    await this.findOne(id);
    try {
      return await this.prisma.educationType.update({ where: { id }, data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.educationType.delete({ where: { id } });
    } catch (err) {
      rethrowDeleteConflict(err, 'No se puede eliminar: el tipo de formación está en uso');
    }
  }
}
