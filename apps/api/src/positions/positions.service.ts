import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePositionDto } from './dto/create-position.dto.js';
import { UpdatePositionDto } from './dto/update-position.dto.js';

@Injectable()
export class PositionsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreatePositionDto) {
    return this.prisma.position.create({ data: dto });
  }

  findAll() {
    return this.prisma.position.findMany({
      include: { department: true },
      orderBy: { title: 'asc' },
    });
  }

  async findOne(id: string) {
    const position = await this.prisma.position.findUnique({
      where: { id },
      include: { department: true },
    });
    if (!position) throw new NotFoundException('Cargo no encontrado');
    return position;
  }

  async update(id: string, dto: UpdatePositionDto) {
    await this.findOne(id);
    return this.prisma.position.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.position.delete({ where: { id } });
  }
}
