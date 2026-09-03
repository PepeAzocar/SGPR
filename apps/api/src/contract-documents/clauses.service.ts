import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateClauseDto } from './dto/create-clause.dto.js';
import { UpdateClauseDto } from './dto/update-clause.dto.js';
import { CreateClauseVersionDto } from './dto/create-clause-version.dto.js';
import { rethrowAsHttpError, rethrowDeleteConflict } from '../common/utils/prisma-error.util.js';
import { extractTemplateTokens, TemplateError } from './engine/template-engine.js';

const include = { versions: { orderBy: { versionNumber: 'desc' as const } } };

@Injectable()
export class ClausesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateClauseDto, createdBy?: string) {
    try {
      return await this.prisma.clause.create({ data: { ...dto, createdBy }, include });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  findAll() {
    return this.prisma.clause.findMany({ include, orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const clause = await this.prisma.clause.findUnique({ where: { id }, include });
    if (!clause) throw new NotFoundException('Cláusula no encontrada');
    return clause;
  }

  async update(id: string, dto: UpdateClauseDto) {
    await this.findOne(id);
    try {
      return await this.prisma.clause.update({ where: { id }, data: dto, include });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.clause.delete({ where: { id } });
    } catch (err) {
      rethrowDeleteConflict(err, 'No se puede eliminar: la cláusula tiene versiones o matrices asociadas');
    }
  }

  private assertValidSyntax(content: string) {
    try {
      extractTemplateTokens(content);
    } catch (err) {
      if (err instanceof TemplateError) throw new BadRequestException(`Cláusula inválida: ${err.message}`);
      throw err;
    }
  }

  async createVersion(clauseId: string, dto: CreateClauseVersionDto, createdBy?: string) {
    await this.findOne(clauseId);
    this.assertValidSyntax(dto.content);
    const last = await this.prisma.clauseVersion.findFirst({ where: { clauseId }, orderBy: { versionNumber: 'desc' } });
    const versionNumber = (last?.versionNumber ?? 0) + 1;
    return this.prisma.clauseVersion.create({ data: { ...dto, clauseId, versionNumber, createdBy } });
  }

  async updateVersion(versionId: string, dto: CreateClauseVersionDto) {
    const version = await this.findVersion(versionId);
    if (version.status !== 'DRAFT') {
      throw new BadRequestException('Sólo se puede editar una versión en estado BORRADOR; cree una nueva versión en su lugar');
    }
    this.assertValidSyntax(dto.content);
    return this.prisma.clauseVersion.update({ where: { id: versionId }, data: dto });
  }

  private async findVersion(versionId: string) {
    const version = await this.prisma.clauseVersion.findUnique({ where: { id: versionId } });
    if (!version) throw new NotFoundException('Versión de cláusula no encontrada');
    return version;
  }

  async publishVersion(versionId: string, publishedBy?: string) {
    const version = await this.findVersion(versionId);
    if (version.status !== 'DRAFT') {
      throw new BadRequestException(`No se puede publicar una versión en estado "${version.status}"; debe estar en BORRADOR`);
    }
    return this.prisma.$transaction(async (tx) => {
      await tx.clauseVersion.updateMany({
        where: { clauseId: version.clauseId, status: 'PUBLISHED', id: { not: versionId } },
        data: { status: 'RETIRED', validTo: version.validFrom ?? new Date() },
      });
      return tx.clauseVersion.update({
        where: { id: versionId },
        data: { status: 'PUBLISHED', publishedAt: new Date(), publishedBy },
      });
    });
  }

  async retireVersion(versionId: string) {
    const version = await this.findVersion(versionId);
    if (version.status !== 'PUBLISHED') {
      throw new BadRequestException('Sólo se puede retirar una versión PUBLICADA');
    }
    return this.prisma.clauseVersion.update({ where: { id: versionId }, data: { status: 'RETIRED', validTo: new Date() } });
  }
}
