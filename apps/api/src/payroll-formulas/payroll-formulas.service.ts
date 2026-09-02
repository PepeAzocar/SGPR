import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePayrollFormulaDto } from './dto/create-payroll-formula.dto.js';
import { UpdatePayrollFormulaDto } from './dto/update-payroll-formula.dto.js';
import { EvaluateFormulaDto } from './dto/evaluate-formula.dto.js';
import { evaluateFormula, FormulaError, parseFormula } from './formula-engine.js';
import { rethrowAsHttpError } from '../common/utils/prisma-error.util.js';
import type { PayrollFormulaStatus } from '../generated/prisma/enums.js';

const include = { concept: true, laborRegime: true, legalEntity: true };

function assertValidSyntax(formulaExpression: string, condition?: string | null) {
  try {
    parseFormula(formulaExpression);
    if (condition) parseFormula(condition);
  } catch (err) {
    if (err instanceof FormulaError) throw new BadRequestException(`Fórmula inválida: ${err.message}`);
    throw err;
  }
}

@Injectable()
export class PayrollFormulasService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePayrollFormulaDto, createdBy?: string) {
    assertValidSyntax(dto.formulaExpression, dto.condition);

    const last = await this.prisma.payrollFormula.findFirst({
      where: { conceptId: dto.conceptId },
      orderBy: { version: 'desc' },
    });
    const version = (last?.version ?? 0) + 1;

    try {
      return await this.prisma.payrollFormula.create({
        data: { ...dto, version, createdBy },
        include,
      });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  findAll(filters: { conceptId?: string; status?: string; laborRegimeId?: string }) {
    return this.prisma.payrollFormula.findMany({
      where: {
        conceptId: filters.conceptId,
        status: filters.status as PayrollFormulaStatus | undefined,
        laborRegimeId: filters.laborRegimeId,
      },
      include,
      orderBy: [{ conceptId: 'asc' }, { version: 'desc' }],
    });
  }

  async findOne(id: string) {
    const formula = await this.prisma.payrollFormula.findUnique({ where: { id }, include });
    if (!formula) throw new NotFoundException('Fórmula no encontrada');
    return formula;
  }

  /** Nunca se edita fuera de DRAFT: para cambiar una fórmula en uso hay que crear una nueva versión. */
  async update(id: string, dto: UpdatePayrollFormulaDto) {
    const current = await this.findOne(id);
    if (current.status !== 'DRAFT') {
      throw new BadRequestException('Sólo se puede editar una fórmula en estado BORRADOR; cree una nueva versión en su lugar');
    }
    if (dto.formulaExpression || dto.condition) {
      assertValidSyntax(dto.formulaExpression ?? current.formulaExpression, dto.condition ?? current.condition);
    }
    try {
      return await this.prisma.payrollFormula.update({ where: { id }, data: dto, include });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async remove(id: string) {
    const current = await this.findOne(id);
    if (current.status !== 'DRAFT') {
      throw new BadRequestException('Sólo se puede eliminar una fórmula en estado BORRADOR; las demás se desactivan');
    }
    return this.prisma.payrollFormula.delete({ where: { id } });
  }

  private async transition(id: string, from: PayrollFormulaStatus[], to: PayrollFormulaStatus, extra: Record<string, unknown> = {}) {
    const current = await this.findOne(id);
    if (!from.includes(current.status)) {
      throw new BadRequestException(
        `No se puede pasar de "${current.status}" a "${to}" (se esperaba: ${from.join(', ')})`,
      );
    }
    return this.prisma.payrollFormula.update({ where: { id }, data: { status: to, ...extra }, include });
  }

  submitForTesting(id: string) {
    return this.transition(id, ['DRAFT'], 'TESTING');
  }

  submitForApproval(id: string) {
    return this.transition(id, ['TESTING'], 'PENDING_APPROVAL');
  }

  approve(id: string, approvedBy?: string) {
    return this.transition(id, ['PENDING_APPROVAL'], 'APPROVED', { approvedBy, approvedAt: new Date() });
  }

  reject(id: string) {
    return this.transition(id, ['PENDING_APPROVAL'], 'REJECTED');
  }

  /**
   * Activa la fórmula y cierra automáticamente cualquier otra fórmula ACTIVA
   * del mismo concepto y mismo alcance (régimen jurídico + entidad legal),
   * igual que el resto de los históricos del sistema: nunca dos versiones
   * activas simultáneas para el mismo concepto y alcance.
   */
  async activate(id: string) {
    const formula = await this.findOne(id);
    if (formula.status !== 'APPROVED') {
      throw new BadRequestException(`No se puede activar una fórmula en estado "${formula.status}"; debe estar APROBADA`);
    }
    return this.prisma.$transaction(async (tx) => {
      await tx.payrollFormula.updateMany({
        where: {
          conceptId: formula.conceptId,
          laborRegimeId: formula.laborRegimeId,
          legalEntityId: formula.legalEntityId,
          status: 'ACTIVE',
          id: { not: id },
        },
        data: { status: 'INACTIVE', effectiveTo: formula.effectiveFrom },
      });
      return tx.payrollFormula.update({ where: { id }, data: { status: 'ACTIVE' }, include });
    });
  }

  async deactivate(id: string, effectiveTo?: Date) {
    const formula = await this.findOne(id);
    if (formula.status !== 'ACTIVE') {
      throw new BadRequestException('Sólo se puede desactivar una fórmula ACTIVA');
    }
    return this.prisma.payrollFormula.update({
      where: { id },
      data: { status: 'INACTIVE', effectiveTo: effectiveTo ?? new Date() },
      include,
    });
  }

  /** Simulador ("Testear"): evalúa una expresión contra variables de prueba, sin tocar la base de datos. */
  evaluate(dto: EvaluateFormulaDto) {
    try {
      const result = evaluateFormula(dto.formulaExpression, { variables: dto.variables });
      const conditionMet = dto.condition ? evaluateFormula(dto.condition, { variables: dto.variables }) !== 0 : undefined;
      return { result, conditionMet };
    } catch (err) {
      if (err instanceof FormulaError) throw new BadRequestException(err.message);
      throw err;
    }
  }
}
