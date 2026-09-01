import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateAfpEntityDto } from './dto/create-afp-entity.dto.js';
import { UpdateAfpEntityDto } from './dto/update-afp-entity.dto.js';

@Injectable()
export class AfpEntitiesService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateAfpEntityDto) {
    return this.prisma.afpEntity.create({ data: dto });
  }

  findAll() {
    return this.prisma.afpEntity.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const afp = await this.prisma.afpEntity.findUnique({ where: { id } });
    if (!afp) throw new NotFoundException('AFP no encontrada');
    return afp;
  }

  async update(id: string, dto: UpdateAfpEntityDto) {
    await this.findOne(id);
    return this.prisma.afpEntity.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.afpEntity.delete({ where: { id } });
  }
}
