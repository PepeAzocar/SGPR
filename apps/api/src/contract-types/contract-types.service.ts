import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateContractTypeDto } from './dto/create-contract-type.dto.js';
import { UpdateContractTypeDto } from './dto/update-contract-type.dto.js';
import { rethrowAsHttpError, rethrowDeleteConflict } from '../common/utils/prisma-error.util.js';

@Injectable()
export class ContractTypesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateContractTypeDto) {
    try {
      return await this.prisma.contractType.create({ data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  findAll(laborRegimeId?: string) {
    return this.prisma.contractType.findMany({
      where: laborRegimeId ? { laborRegimeId } : undefined,
      include: { laborRegime: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const contractType = await this.prisma.contractType.findUnique({ where: { id }, include: { laborRegime: true } });
    if (!contractType) throw new NotFoundException('Tipo de contrato no encontrado');
    return contractType;
  }

  async update(id: string, dto: UpdateContractTypeDto) {
    await this.findOne(id);
    try {
      return await this.prisma.contractType.update({ where: { id }, data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.contractType.delete({ where: { id } });
    } catch (err) {
      rethrowDeleteConflict(err, 'No se puede eliminar: hay contratos con este tipo contractual');
    }
  }
}
