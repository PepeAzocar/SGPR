import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateApsEmployeeCategoryDto } from './dto/create-aps-employee-category.dto.js';
import { UpdateApsEmployeeCategoryDto } from './dto/update-aps-employee-category.dto.js';
import { rethrowAsHttpError, rethrowDeleteConflict } from '../common/utils/prisma-error.util.js';

@Injectable()
export class ApsEmployeeCategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateApsEmployeeCategoryDto) {
    try {
      return await this.prisma.apsEmployeeCategory.create({ data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  findAll() {
    return this.prisma.apsEmployeeCategory.findMany({ orderBy: { code: 'asc' } });
  }

  async findOne(id: string) {
    const category = await this.prisma.apsEmployeeCategory.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Categoría funcionaria no encontrada');
    return category;
  }

  async update(id: string, dto: UpdateApsEmployeeCategoryDto) {
    await this.findOne(id);
    try {
      return await this.prisma.apsEmployeeCategory.update({ where: { id }, data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.apsEmployeeCategory.delete({ where: { id } });
    } catch (err) {
      rethrowDeleteConflict(err, 'No se puede eliminar: la categoría está en uso');
    }
  }
}
