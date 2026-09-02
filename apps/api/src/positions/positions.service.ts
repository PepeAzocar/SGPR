import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePositionDto } from './dto/create-position.dto.js';
import { UpdatePositionDto } from './dto/update-position.dto.js';
import { normalizeEffectiveDates } from '../common/utils/date.util.js';
import { rethrowAsHttpError } from '../common/utils/prisma-error.util.js';

@Injectable()
export class PositionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePositionDto, actingUserEmail: string) {
    try {
      return await this.prisma.position.create({
        data: { ...normalizeEffectiveDates(dto), createdBy: actingUserEmail, updatedBy: actingUserEmail },
      });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  findAll() {
    return this.prisma.position.findMany({
      include: { department: true, cargo: true, costCenter: true },
      orderBy: { title: 'asc' },
    });
  }

  async findOne(id: string) {
    const position = await this.prisma.position.findUnique({
      where: { id },
      include: { department: true, cargo: true, costCenter: true },
    });
    if (!position) throw new NotFoundException('Posición no encontrada');
    return position;
  }

  async update(id: string, dto: UpdatePositionDto, actingUserEmail: string) {
    await this.findOne(id);
    try {
      return await this.prisma.position.update({
        where: { id },
        data: { ...normalizeEffectiveDates(dto), updatedBy: actingUserEmail },
      });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.position.delete({ where: { id } });
    } catch {
      throw new ConflictException('No se puede eliminar: tiene contratos asociados');
    }
  }
}
