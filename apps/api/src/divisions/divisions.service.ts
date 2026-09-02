import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDivisionDto } from './dto/create-division.dto.js';
import { UpdateDivisionDto } from './dto/update-division.dto.js';
import { normalizeEffectiveDates } from '../common/utils/date.util.js';
import { rethrowAsHttpError } from '../common/utils/prisma-error.util.js';

@Injectable()
export class DivisionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDivisionDto, actingUserEmail: string) {
    try {
      return await this.prisma.division.create({
        data: { ...normalizeEffectiveDates(dto), createdBy: actingUserEmail, updatedBy: actingUserEmail },
      });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  findAll() {
    return this.prisma.division.findMany({
      include: { businessUnit: true, parent: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const entity = await this.prisma.division.findUnique({
      where: { id },
      include: { businessUnit: true, parent: true, children: true },
    });
    if (!entity) throw new NotFoundException('División no encontrada');
    return entity;
  }

  async update(id: string, dto: UpdateDivisionDto, actingUserEmail: string) {
    await this.findOne(id);
    if (dto.parentDivisionId === id) {
      throw new BadRequestException('Una división no puede ser su propia división padre');
    }
    try {
      return await this.prisma.division.update({
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
      return await this.prisma.division.delete({ where: { id } });
    } catch {
      throw new ConflictException('No se puede eliminar: tiene divisiones o departamentos asociados');
    }
  }
}
