import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateBankAccountTypeDto } from './dto/create-bank-account-type.dto.js';
import { UpdateBankAccountTypeDto } from './dto/update-bank-account-type.dto.js';
import { rethrowAsHttpError, rethrowDeleteConflict } from '../common/utils/prisma-error.util.js';

@Injectable()
export class BankAccountTypesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateBankAccountTypeDto) {
    try {
      return await this.prisma.bankAccountType.create({ data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  findAll() {
    return this.prisma.bankAccountType.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const type = await this.prisma.bankAccountType.findUnique({ where: { id } });
    if (!type) throw new NotFoundException('Tipo de cuenta no encontrado');
    return type;
  }

  async update(id: string, dto: UpdateBankAccountTypeDto) {
    await this.findOne(id);
    try {
      return await this.prisma.bankAccountType.update({ where: { id }, data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.bankAccountType.delete({ where: { id } });
    } catch (err) {
      rethrowDeleteConflict(err, 'No se puede eliminar: hay cuentas bancarias registradas con este tipo');
    }
  }
}
