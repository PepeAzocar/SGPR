import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDepartmentDto } from './dto/create-department.dto.js';
import { UpdateDepartmentDto } from './dto/update-department.dto.js';
import { normalizeEffectiveDates } from '../common/utils/date.util.js';
import { rethrowAsHttpError } from '../common/utils/prisma-error.util.js';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDepartmentDto, actingUserEmail: string) {
    try {
      return await this.prisma.department.create({
        data: { ...normalizeEffectiveDates(dto), createdBy: actingUserEmail, updatedBy: actingUserEmail },
      });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  findAll() {
    return this.prisma.department.findMany({
      include: { division: true, costCenter: true, parent: true, children: true, positions: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: { division: true, costCenter: true, children: true, positions: true, parent: true },
    });
    if (!department) throw new NotFoundException('Departamento no encontrado');
    return department;
  }

  async update(id: string, dto: UpdateDepartmentDto, actingUserEmail: string) {
    await this.findOne(id);
    if (dto.parentId === id) {
      throw new BadRequestException('Un departamento no puede ser su propio departamento padre');
    }
    try {
      return await this.prisma.department.update({
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
      return await this.prisma.department.delete({ where: { id } });
    } catch {
      throw new ConflictException('No se puede eliminar: tiene departamentos o posiciones asociadas');
    }
  }
}
