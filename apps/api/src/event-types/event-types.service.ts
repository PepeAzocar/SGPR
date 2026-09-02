import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateEventTypeDto } from './dto/create-event-type.dto.js';
import { UpdateEventTypeDto } from './dto/update-event-type.dto.js';
import { rethrowAsHttpError, rethrowDeleteConflict } from '../common/utils/prisma-error.util.js';

@Injectable()
export class EventTypesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEventTypeDto) {
    try {
      return await this.prisma.eventType.create({ data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  findAll() {
    return this.prisma.eventType.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const eventType = await this.prisma.eventType.findUnique({ where: { id } });
    if (!eventType) throw new NotFoundException('Tipo de evento no encontrado');
    return eventType;
  }

  async update(id: string, dto: UpdateEventTypeDto) {
    await this.findOne(id);
    try {
      return await this.prisma.eventType.update({ where: { id }, data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.eventType.delete({ where: { id } });
    } catch (err) {
      rethrowDeleteConflict(err, 'No se puede eliminar: tiene motivos o movimientos asociados');
    }
  }
}
