import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateEmployeeBankAccountDto } from './dto/create-employee-bank-account.dto.js';
import { UpdateEmployeeBankAccountDto } from './dto/update-employee-bank-account.dto.js';
import { rethrowAsHttpError } from '../common/utils/prisma-error.util.js';

const include = { bank: true, accountType: true, paymentMethod: true, employeeEvent: true };

@Injectable()
export class EmployeeBankAccountsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEmployeeBankAccountDto) {
    const isPrimary = dto.isPrimary ?? true;
    try {
      return await this.prisma.$transaction(async (tx) => {
        // Igual que EmployeeAfp: no se sobrescribe la cuenta anterior, se
        // cierra su vigencia en la fecha en que empieza a regir la nueva.
        if (isPrimary) {
          await tx.employeeBankAccount.updateMany({
            where: { employeeId: dto.employeeId, isPrimary: true, status: 'ACTIVE', effectiveTo: null },
            data: { status: 'FINISHED', effectiveTo: dto.effectiveFrom },
          });
        }
        return tx.employeeBankAccount.create({ data: { ...dto, isPrimary }, include });
      });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  findAll(employeeId?: string) {
    return this.prisma.employeeBankAccount.findMany({
      where: employeeId ? { employeeId } : undefined,
      include,
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  async findOne(id: string) {
    const account = await this.prisma.employeeBankAccount.findUnique({ where: { id }, include });
    if (!account) throw new NotFoundException('Cuenta bancaria no encontrada');
    return account;
  }

  async update(id: string, dto: UpdateEmployeeBankAccountDto) {
    await this.findOne(id);
    try {
      return await this.prisma.employeeBankAccount.update({ where: { id }, data: dto, include });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.employeeBankAccount.delete({ where: { id } });
  }
}
