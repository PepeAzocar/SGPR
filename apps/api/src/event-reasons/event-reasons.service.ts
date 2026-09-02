import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateEventReasonDto } from './dto/create-event-reason.dto.js';
import { UpdateEventReasonDto } from './dto/update-event-reason.dto.js';
import { rethrowAsHttpError, rethrowDeleteConflict } from '../common/utils/prisma-error.util.js';

function withDisplayName<T extends { name: string; eventType: { name: string } }>(reason: T) {
  return { ...reason, displayName: `${reason.name} — ${reason.eventType.name}` };
}

@Injectable()
export class EventReasonsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEventReasonDto) {
    try {
      return await this.prisma.eventReason.create({ data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async findAll(eventTypeId?: string) {
    const reasons = await this.prisma.eventReason.findMany({
      where: eventTypeId ? { eventTypeId } : undefined,
      include: { eventType: true },
      orderBy: { name: 'asc' },
    });
    return reasons.map(withDisplayName);
  }

  async findOne(id: string) {
    const reason = await this.prisma.eventReason.findUnique({ where: { id }, include: { eventType: true } });
    if (!reason) throw new NotFoundException('Motivo de evento no encontrado');
    return withDisplayName(reason);
  }

  async update(id: string, dto: UpdateEventReasonDto) {
    await this.findOne(id);
    try {
      return await this.prisma.eventReason.update({ where: { id }, data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.eventReason.delete({ where: { id } });
    } catch (err) {
      rethrowDeleteConflict(err, 'No se puede eliminar: hay movimientos con este motivo');
    }
  }
}
