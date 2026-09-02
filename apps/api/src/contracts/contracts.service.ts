import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { CreateContractDto } from './dto/create-contract.dto.js';
import { UpdateContractDto } from './dto/update-contract.dto.js';
import { rethrowAsHttpError, rethrowDeleteConflict } from '../common/utils/prisma-error.util.js';

const include = {
  employee: true,
  position: { include: { department: true } },
  legalEntity: true,
  laborRegime: true,
  contractType: true,
};

@Injectable()
export class ContractsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Un colaborador puede tener más de un contrato activo (ej. renovaciones
   * consecutivas de plazo fijo) siempre que sus vigencias no se traslapen.
   * Cada vez que un contrato queda activo con una fecha de inicio/término
   * determinada, cualquier otro contrato activo del mismo colaborador cuya
   * vigencia se superponga con la de éste se marca automáticamente como
   * inactivo: no se rechaza la operación, se resuelve el conflicto.
   */
  private async deactivateOverlapping(
    tx: Prisma.TransactionClient,
    employeeId: string,
    contractId: string,
    startDate: Date,
    endDate: Date | null,
  ) {
    const overlapping = await tx.contract.findMany({
      where: {
        employeeId,
        id: { not: contractId },
        isActive: true,
        OR: [{ endDate: null }, { endDate: { gte: startDate } }],
        ...(endDate ? { startDate: { lte: endDate } } : {}),
      },
      select: { id: true },
    });
    if (overlapping.length > 0) {
      await tx.contract.updateMany({
        where: { id: { in: overlapping.map((c) => c.id) } },
        data: { isActive: false },
      });
    }
  }

  async create(dto: CreateContractDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const created = await tx.contract.create({ data: dto, include });
        if (created.isActive) {
          await this.deactivateOverlapping(tx, created.employeeId, created.id, created.startDate, created.endDate);
        }
        return created;
      });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  findAll() {
    return this.prisma.contract.findMany({
      include,
      orderBy: { startDate: 'desc' },
    });
  }

  async findOne(id: string) {
    const contract = await this.prisma.contract.findUnique({ where: { id }, include });
    if (!contract) throw new NotFoundException('Contrato no encontrado');
    return contract;
  }

  async update(id: string, dto: UpdateContractDto) {
    await this.findOne(id);
    try {
      return await this.prisma.$transaction(async (tx) => {
        const updated = await tx.contract.update({ where: { id }, data: dto, include });
        if (updated.isActive) {
          await this.deactivateOverlapping(tx, updated.employeeId, updated.id, updated.startDate, updated.endDate);
        }
        return updated;
      });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.contract.delete({ where: { id } });
    } catch (err) {
      rethrowDeleteConflict(err, 'No se puede eliminar: el contrato tiene registros asociados');
    }
  }
}
