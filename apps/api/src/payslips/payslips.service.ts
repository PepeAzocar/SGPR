import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PayslipsService {
  constructor(private prisma: PrismaService) {}

  findAll(employeeId?: string, periodId?: string) {
    return this.prisma.payslip.findMany({
      where: { employeeId, periodId },
      include: { employee: true, period: true, items: { include: { concept: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const payslip = await this.prisma.payslip.findUnique({
      where: { id },
      include: { employee: true, period: true, items: { include: { concept: true } } },
    });
    if (!payslip) throw new NotFoundException('Liquidación no encontrada');
    return payslip;
  }
}
