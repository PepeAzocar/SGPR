import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto.js';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto.js';
import { rethrowAsHttpError, rethrowDeleteConflict } from '../common/utils/prisma-error.util.js';

@Injectable()
export class PaymentMethodsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePaymentMethodDto) {
    try {
      return await this.prisma.paymentMethod.create({ data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  findAll() {
    return this.prisma.paymentMethod.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const method = await this.prisma.paymentMethod.findUnique({ where: { id } });
    if (!method) throw new NotFoundException('Forma de pago no encontrada');
    return method;
  }

  async update(id: string, dto: UpdatePaymentMethodDto) {
    await this.findOne(id);
    try {
      return await this.prisma.paymentMethod.update({ where: { id }, data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.paymentMethod.delete({ where: { id } });
    } catch (err) {
      rethrowDeleteConflict(err, 'No se puede eliminar: hay cuentas bancarias registradas con esta forma de pago');
    }
  }
}
