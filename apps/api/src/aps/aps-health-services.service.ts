import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateApsHealthServiceDto } from './dto/create-aps-health-service.dto.js';
import { UpdateApsHealthServiceDto } from './dto/update-aps-health-service.dto.js';
import { rethrowAsHttpError, rethrowDeleteConflict } from '../common/utils/prisma-error.util.js';

const include = { region: true };

@Injectable()
export class ApsHealthServicesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateApsHealthServiceDto) {
    try {
      return await this.prisma.apsHealthService.create({ data: dto, include });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  findAll() {
    return this.prisma.apsHealthService.findMany({ include, orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const service = await this.prisma.apsHealthService.findUnique({ where: { id }, include });
    if (!service) throw new NotFoundException('Servicio de Salud no encontrado');
    return service;
  }

  async update(id: string, dto: UpdateApsHealthServiceDto) {
    await this.findOne(id);
    try {
      return await this.prisma.apsHealthService.update({ where: { id }, data: dto, include });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.apsHealthService.delete({ where: { id } });
    } catch (err) {
      rethrowDeleteConflict(err, 'No se puede eliminar: el Servicio de Salud está en uso');
    }
  }
}
