import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateEmployeeEventDto } from './dto/create-employee-event.dto.js';
import { rethrowAsHttpError } from '../common/utils/prisma-error.util.js';

const include = {
  employee: true,
  eventType: true,
  eventReason: true,
  laborRegime: true,
  changes: true,
} as const;

export interface EmployeeEventFilters {
  employeeId?: string;
  year?: number;
  month?: number;
  eventTypeId?: string;
  status?: string;
  payrollRelevant?: boolean;
  retroactive?: boolean;
}

@Injectable()
export class EmployeeEventsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEmployeeEventDto, actingUserEmail?: string) {
    const employee = await this.prisma.employee.findUnique({ where: { id: dto.employeeId } });
    if (!employee) throw new NotFoundException('Colaborador no encontrado');

    const eventType = await this.prisma.eventType.findUnique({ where: { id: dto.eventTypeId } });
    if (!eventType) throw new BadRequestException('Tipo de evento no válido');

    const eventReason = await this.prisma.eventReason.findUnique({ where: { id: dto.eventReasonId } });
    if (!eventReason || eventReason.eventTypeId !== dto.eventTypeId) {
      throw new BadRequestException('El motivo seleccionado no corresponde al evento elegido');
    }

    const currentContract = await this.prisma.contract.findFirst({
      where: { employeeId: dto.employeeId, isActive: true },
      orderBy: { startDate: 'desc' },
    });

    const sequenceNumber = (await this.prisma.employeeEvent.count({ where: { employeeId: dto.employeeId } })) + 1;
    const retroactive = await this.isRetroactive(dto.effectiveDate);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const event = await tx.employeeEvent.create({
          data: {
            employeeId: dto.employeeId,
            effectiveDate: dto.effectiveDate,
            sequenceNumber,
            eventTypeId: dto.eventTypeId,
            eventReasonId: dto.eventReasonId,
            description: dto.description,
            documentReference: dto.documentReference,
            laborRegimeId: currentContract?.laborRegimeId ?? null,
            payrollRelevant: eventType.payrollRelevant,
            retroactive,
            createdBy: actingUserEmail,
            changes: dto.changes?.length ? { create: dto.changes.map((c) => ({ ...c })) } : undefined,
          },
          include,
        });

        // Los únicos campos que hoy tienen un lugar natural fuera del historial
        // (sueldo base, horas semanales y régimen jurídico viven en Contract) se
        // aplican de inmediato sobre el contrato activo del colaborador. Cambios
        // estructurales (centro de costo, posición) quedan sólo en el historial:
        // Position es un catálogo compartido y su reasignación real sigue
        // haciéndose creando un nuevo Contract, no editando este movimiento.
        if (currentContract && dto.changes?.length) {
          const contractData: Record<string, unknown> = {};
          for (const change of dto.changes) {
            if (change.fieldCode === 'BASE_SALARY' && change.newValue != null) {
              const n = Number(change.newValue);
              if (!Number.isNaN(n)) contractData.baseSalary = n;
            }
            if (change.fieldCode === 'WEEKLY_HOURS' && change.newValue != null) {
              const n = Number(change.newValue);
              if (!Number.isNaN(n)) contractData.weeklyHours = n;
            }
            if (change.fieldCode === 'LABOR_REGIME' && change.newReferenceId) {
              contractData.laborRegimeId = change.newReferenceId;
            }
          }
          if (Object.keys(contractData).length > 0) {
            await tx.contract.update({ where: { id: currentContract.id }, data: contractData });
          }
        }

        return event;
      });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  private async isRetroactive(effectiveDate: Date): Promise<boolean> {
    const lastProcessed = await this.prisma.payrollPeriod.findFirst({
      where: { status: { in: ['CALCULATED', 'CLOSED', 'PAID'] } },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
    if (!lastProcessed) return false;
    const periodEnd = new Date(Date.UTC(lastProcessed.year, lastProcessed.month, 0, 23, 59, 59));
    return effectiveDate.getTime() <= periodEnd.getTime();
  }

  findAll(filters: EmployeeEventFilters) {
    const where: Record<string, unknown> = {};
    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.eventTypeId) where.eventTypeId = filters.eventTypeId;
    if (filters.status) where.status = filters.status;
    if (filters.payrollRelevant != null) where.payrollRelevant = filters.payrollRelevant;
    if (filters.retroactive != null) where.retroactive = filters.retroactive;
    if (filters.year != null) {
      const startMonth = filters.month ?? 1;
      const endMonth = filters.month ?? 12;
      where.effectiveDate = {
        gte: new Date(Date.UTC(filters.year, startMonth - 1, 1)),
        lt: new Date(Date.UTC(filters.year, endMonth, 1)),
      };
    }
    return this.prisma.employeeEvent.findMany({ where, include, orderBy: { effectiveDate: 'desc' } });
  }

  async findOne(id: string) {
    const event = await this.prisma.employeeEvent.findUnique({ where: { id }, include });
    if (!event) throw new NotFoundException('Movimiento no encontrado');
    return event;
  }

  async cancel(id: string) {
    const event = await this.findOne(id);
    if (event.status === 'CANCELLED') return event;
    return this.prisma.employeeEvent.update({ where: { id }, data: { status: 'CANCELLED' }, include });
  }
}
