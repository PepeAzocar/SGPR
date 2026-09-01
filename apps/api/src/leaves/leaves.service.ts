import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateLeafDto } from './dto/create-leaf.dto.js';
import { UpdateLeafDto } from './dto/update-leaf.dto.js';

@Injectable()
export class LeavesService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateLeafDto) {
    return this.prisma.leave.create({ data: dto });
  }

  findAll() {
    return this.prisma.leave.findMany({
      include: { employee: true },
      orderBy: { startDate: 'desc' },
    });
  }

  async findOne(id: string) {
    const leave = await this.prisma.leave.findUnique({
      where: { id },
      include: { employee: true },
    });
    if (!leave) throw new NotFoundException('Ausencia no encontrada');
    return leave;
  }

  async update(id: string, dto: UpdateLeafDto) {
    await this.findOne(id);
    return this.prisma.leave.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.leave.delete({ where: { id } });
  }
}
