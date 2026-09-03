import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateApsFacilityTypeDto } from './dto/create-aps-facility-type.dto.js';
import { UpdateApsFacilityTypeDto } from './dto/update-aps-facility-type.dto.js';
import { rethrowAsHttpError, rethrowDeleteConflict } from '../common/utils/prisma-error.util.js';

@Injectable()
export class ApsFacilityTypesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateApsFacilityTypeDto) {
    try {
      return await this.prisma.apsFacilityType.create({ data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  findAll() {
    return this.prisma.apsFacilityType.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const type = await this.prisma.apsFacilityType.findUnique({ where: { id } });
    if (!type) throw new NotFoundException('Tipo de establecimiento no encontrado');
    return type;
  }

  async update(id: string, dto: UpdateApsFacilityTypeDto) {
    await this.findOne(id);
    try {
      return await this.prisma.apsFacilityType.update({ where: { id }, data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.apsFacilityType.delete({ where: { id } });
    } catch (err) {
      rethrowDeleteConflict(err, 'No se puede eliminar: el tipo de establecimiento está en uso');
    }
  }
}
