import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateContractMatrixDto } from './dto/create-contract-matrix.dto.js';
import { UpdateContractMatrixDto } from './dto/update-contract-matrix.dto.js';
import { CreateMatrixClauseDto } from './dto/create-matrix-clause.dto.js';
import { rethrowAsHttpError } from '../common/utils/prisma-error.util.js';

const include = {
  legalRegime: true,
  contractType: true,
  template: true,
  clauses: { include: { clause: true }, orderBy: { sequence: 'asc' as const } },
};

@Injectable()
export class ContractMatricesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateContractMatrixDto, createdBy?: string) {
    try {
      return await this.prisma.contractMatrix.create({
        data: { ...dto, createdBy, updatedBy: createdBy },
        include,
      });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  findAll(filters: { documentType?: string; status?: string; legalRegimeId?: string }) {
    return this.prisma.contractMatrix.findMany({
      where: {
        documentType: filters.documentType,
        status: filters.status as 'DRAFT' | 'ACTIVE' | 'INACTIVE' | undefined,
        legalRegimeId: filters.legalRegimeId,
      },
      include,
      orderBy: [{ documentType: 'asc' }, { priority: 'asc' }],
    });
  }

  async findOne(id: string) {
    const matrix = await this.prisma.contractMatrix.findUnique({ where: { id }, include });
    if (!matrix) throw new NotFoundException('Matriz contractual no encontrada');
    return matrix;
  }

  async update(id: string, dto: UpdateContractMatrixDto, updatedBy?: string) {
    const current = await this.findOne(id);
    if (current.status !== 'DRAFT') {
      throw new BadRequestException('Sólo se puede editar una matriz en estado BORRADOR; desactívela y cree una nueva en su lugar');
    }
    try {
      return await this.prisma.contractMatrix.update({ where: { id }, data: { ...dto, updatedBy }, include });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async remove(id: string) {
    const current = await this.findOne(id);
    if (current.status !== 'DRAFT') {
      throw new BadRequestException('Sólo se puede eliminar una matriz en estado BORRADOR; las demás se desactivan');
    }
    return this.prisma.contractMatrix.delete({ where: { id } });
  }

  /**
   * Activa la matriz y cierra automáticamente cualquier otra matriz ACTIVA
   * con el mismo alcance (tipo de documento + régimen jurídico + tipo de
   * contrato), igual mecanismo que PayrollFormula.activate(): nunca dos
   * matrices activas simultáneas para el mismo alcance.
   */
  async activate(id: string, updatedBy?: string) {
    const matrix = await this.findOne(id);
    if (matrix.status !== 'DRAFT') {
      throw new BadRequestException(`No se puede activar una matriz en estado "${matrix.status}"; debe estar en BORRADOR`);
    }
    return this.prisma.$transaction(async (tx) => {
      await tx.contractMatrix.updateMany({
        where: {
          documentType: matrix.documentType,
          legalRegimeId: matrix.legalRegimeId,
          contractTypeId: matrix.contractTypeId,
          status: 'ACTIVE',
          id: { not: id },
        },
        data: { status: 'INACTIVE', validTo: matrix.validFrom },
      });
      return tx.contractMatrix.update({ where: { id }, data: { status: 'ACTIVE', updatedBy }, include });
    });
  }

  async deactivate(id: string, updatedBy?: string, validTo?: Date) {
    const matrix = await this.findOne(id);
    if (matrix.status !== 'ACTIVE') {
      throw new BadRequestException('Sólo se puede desactivar una matriz ACTIVA');
    }
    return this.prisma.contractMatrix.update({
      where: { id },
      data: { status: 'INACTIVE', validTo: validTo ?? new Date(), updatedBy },
      include,
    });
  }

  async addClause(matrixId: string, dto: CreateMatrixClauseDto) {
    const matrix = await this.findOne(matrixId);
    if (matrix.status !== 'DRAFT') {
      throw new BadRequestException('Sólo se pueden agregar cláusulas a una matriz en estado BORRADOR');
    }
    try {
      await this.prisma.matrixClause.create({
        data: { matrixId, clauseId: dto.clauseId, sequence: dto.sequence, mandatory: dto.mandatory ?? true },
      });
    } catch (err) {
      rethrowAsHttpError(err);
    }
    return this.findOne(matrixId);
  }

  async removeClause(matrixId: string, matrixClauseId: string) {
    const matrix = await this.findOne(matrixId);
    if (matrix.status !== 'DRAFT') {
      throw new BadRequestException('Sólo se pueden quitar cláusulas de una matriz en estado BORRADOR');
    }
    await this.prisma.matrixClause.delete({ where: { id: matrixClauseId } });
    return this.findOne(matrixId);
  }
}
