import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateNationalityDto } from './dto/create-nationality.dto.js';
import { UpdateNationalityDto } from './dto/update-nationality.dto.js';
import { rethrowAsHttpError, rethrowDeleteConflict } from '../common/utils/prisma-error.util.js';

@Injectable()
export class NationalitiesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateNationalityDto) {
    try {
      return await this.prisma.nationality.create({ data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  findAll() {
    return this.prisma.nationality.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const nationality = await this.prisma.nationality.findUnique({ where: { id } });
    if (!nationality) throw new NotFoundException('Nacionalidad no encontrada');
    return nationality;
  }

  async update(id: string, dto: UpdateNationalityDto) {
    await this.findOne(id);
    try {
      return await this.prisma.nationality.update({ where: { id }, data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.nationality.delete({ where: { id } });
    } catch (err) {
      rethrowDeleteConflict(err, 'No se puede eliminar: la nacionalidad tiene registros asociados');
    }
  }
}
