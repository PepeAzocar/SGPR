import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateBankDto } from './dto/create-bank.dto.js';
import { UpdateBankDto } from './dto/update-bank.dto.js';
import { rethrowAsHttpError, rethrowDeleteConflict } from '../common/utils/prisma-error.util.js';

@Injectable()
export class BanksService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateBankDto) {
    try {
      return await this.prisma.bank.create({ data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  findAll() {
    return this.prisma.bank.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const bank = await this.prisma.bank.findUnique({ where: { id } });
    if (!bank) throw new NotFoundException('Banco no encontrado');
    return bank;
  }

  async update(id: string, dto: UpdateBankDto) {
    await this.findOne(id);
    try {
      return await this.prisma.bank.update({ where: { id }, data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.bank.delete({ where: { id } });
    } catch (err) {
      rethrowDeleteConflict(err, 'No se puede eliminar: hay cuentas bancarias registradas con este banco');
    }
  }
}
