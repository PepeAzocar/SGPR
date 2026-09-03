import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

const listInclude = { employee: true, contract: true, payrollRun: true, employment: true };
const detailInclude = {
  employee: true,
  contract: true,
  payrollRun: true,
  payrollPeriod: true,
  employment: true,
  details: { include: { concept: true }, orderBy: { sequence: 'asc' as const } },
  parent: true,
};

@Injectable()
export class PayrollResultsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Por defecto sólo trae el resultado vigente (isCurrent=true) por
   * colaborador+período. Con current=false devuelve el historial completo
   * (todas las versiones, nunca se borran), ordenado por secuencia.
   */
  findAll(filters: { employeeId?: string; payrollPeriodId?: string; current?: boolean }) {
    const current = filters.current ?? true;
    return this.prisma.payrollResult.findMany({
      where: {
        employeeId: filters.employeeId,
        payrollPeriodId: filters.payrollPeriodId,
        ...(current ? { isCurrent: true } : {}),
      },
      include: listInclude,
      orderBy: [{ employeeId: 'asc' }, { resultSequence: 'asc' }],
    });
  }

  async findOne(id: string) {
    const result = await this.prisma.payrollResult.findUnique({ where: { id }, include: detailInclude });
    if (!result) throw new NotFoundException('Resultado de nómina no encontrado');
    return result;
  }
}
