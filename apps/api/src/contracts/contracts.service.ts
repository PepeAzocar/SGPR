import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateContractDto } from './dto/create-contract.dto.js';
import { UpdateContractDto } from './dto/update-contract.dto.js';

@Injectable()
export class ContractsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateContractDto) {
    return this.prisma.contract.create({ data: dto });
  }

  findAll() {
    return this.prisma.contract.findMany({
      include: { employee: true, position: { include: { department: true } } },
      orderBy: { startDate: 'desc' },
    });
  }

  async findOne(id: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: { employee: true, position: { include: { department: true } } },
    });
    if (!contract) throw new NotFoundException('Contrato no encontrado');
    return contract;
  }

  async update(id: string, dto: UpdateContractDto) {
    await this.findOne(id);
    return this.prisma.contract.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.contract.delete({ where: { id } });
  }
}
