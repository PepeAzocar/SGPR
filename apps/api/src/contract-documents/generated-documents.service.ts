import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { GenerateDocumentDto } from './dto/generate-document.dto.js';
import { CancelDocumentDto } from './dto/cancel-document.dto.js';
import { buildDocumentTokenValues } from './engine/token-resolvers.js';
import { RawHtml, renderTemplate, TemplateError, type UsedToken } from './engine/template-engine.js';
import { nextDocumentNumber } from './document-number.util.js';
import { rethrowAsHttpError } from '../common/utils/prisma-error.util.js';

const include = {
  matrix: true,
  templateVersion: { include: { template: true } },
  employee: true,
  contract: true,
  tokens: true,
};

interface RenderOutcome {
  html: string;
  usedTokens: UsedToken[];
  missingTokens: string[];
}

@Injectable()
export class GeneratedDocumentsService {
  constructor(private prisma: PrismaService) {}

  /** Renderiza el documento de una matriz para un colaborador/contrato/fecha, sin persistir nada. */
  private async renderMatrixDocument(
    matrixId: string,
    documentDate: Date,
    effectiveDate: Date,
    employeeId: string,
    contractId: string,
    documentNumber?: string,
  ): Promise<{ templateVersion: { id: string; content: string }; outcome: RenderOutcome }> {
    const matrix = await this.prisma.contractMatrix.findUnique({
      where: { id: matrixId },
      include: { clauses: { include: { clause: true }, orderBy: { sequence: 'asc' } } },
    });
    if (!matrix) throw new NotFoundException('Matriz contractual no encontrada');
    if (matrix.status !== 'ACTIVE') {
      throw new BadRequestException('Sólo se puede generar un documento desde una matriz ACTIVA');
    }

    const templateVersion = await this.prisma.contractTemplateVersion.findFirst({
      where: {
        templateId: matrix.templateId,
        status: 'PUBLISHED',
        AND: [
          { OR: [{ validFrom: null }, { validFrom: { lte: documentDate } }] },
          { OR: [{ validTo: null }, { validTo: { gte: documentDate } }] },
        ],
      },
      orderBy: { versionNumber: 'desc' },
    });
    if (!templateVersion) {
      throw new BadRequestException('La plantilla de esta matriz no tiene una versión publicada vigente a la fecha del documento');
    }

    const tokenValues = await buildDocumentTokenValues(this.prisma, {
      employeeId,
      contractId,
      documentDate,
      effectiveDate,
      documentNumber,
    });

    const usedTokens = new Map<string, UsedToken>();
    const missingTokens = new Set<string>();

    const clauseHtmlParts: string[] = [];
    for (const mc of matrix.clauses) {
      const clauseVersion = await this.prisma.clauseVersion.findFirst({
        where: {
          clauseId: mc.clauseId,
          status: 'PUBLISHED',
          AND: [
            { OR: [{ validFrom: null }, { validFrom: { lte: documentDate } }] },
            { OR: [{ validTo: null }, { validTo: { gte: documentDate } }] },
          ],
        },
        orderBy: { versionNumber: 'desc' },
      });
      if (!clauseVersion) {
        if (mc.mandatory) {
          throw new BadRequestException(
            `La cláusula "${mc.clause.code}" no tiene versión publicada vigente a la fecha del documento`,
          );
        }
        continue;
      }
      let rendered;
      try {
        rendered = renderTemplate(clauseVersion.content, (path) => tokenValues[path]);
      } catch (err) {
        if (err instanceof TemplateError) throw new BadRequestException(`Cláusula "${mc.clause.code}" inválida: ${err.message}`);
        throw err;
      }
      clauseHtmlParts.push(rendered.html);
      for (const t of rendered.usedTokens) usedTokens.set(t.code, t);
      for (const m of rendered.missingTokens) missingTokens.add(m);
    }

    const clausesHtml = clauseHtmlParts.join('\n');

    let templateRendered;
    try {
      templateRendered = renderTemplate(templateVersion.content, (path) =>
        path === 'clauses' ? new RawHtml(clausesHtml) : tokenValues[path],
      );
    } catch (err) {
      if (err instanceof TemplateError) throw new BadRequestException(`Plantilla inválida: ${err.message}`);
      throw err;
    }
    for (const t of templateRendered.usedTokens) usedTokens.set(t.code, t);
    for (const m of templateRendered.missingTokens) missingTokens.add(m);

    return {
      templateVersion,
      outcome: { html: templateRendered.html, usedTokens: Array.from(usedTokens.values()), missingTokens: Array.from(missingTokens) },
    };
  }

  /** Vista previa: ejecuta el mismo motor que generate(), pero no persiste nada. */
  async preview(dto: GenerateDocumentDto) {
    const { outcome } = await this.renderMatrixDocument(
      dto.matrixId,
      dto.documentDate,
      dto.effectiveDate,
      dto.employeeId,
      dto.contractId,
    );
    return { content: outcome.html, missingTokens: outcome.missingTokens };
  }

  /**
   * Genera y persiste el documento: congela el HTML final, el hash SHA-256 y
   * el valor de cada token usado (GeneratedDocumentToken). Nunca se vuelve a
   * renderizar con datos actuales una vez creado.
   */
  async generate(dto: GenerateDocumentDto, generatedBy?: string) {
    const matrix = await this.prisma.contractMatrix.findUnique({ where: { id: dto.matrixId } });
    if (!matrix) throw new NotFoundException('Matriz contractual no encontrada');

    const documentNumber = await nextDocumentNumber(this.prisma, matrix.documentType, dto.documentDate.getUTCFullYear());

    const { templateVersion, outcome } = await this.renderMatrixDocument(
      dto.matrixId,
      dto.documentDate,
      dto.effectiveDate,
      dto.employeeId,
      dto.contractId,
      documentNumber,
    );

    const contentHash = createHash('sha256').update(outcome.html).digest('hex');

    try {
      return await this.prisma.generatedDocument.create({
        data: {
          documentNumber,
          matrixId: dto.matrixId,
          matrixCodeSnapshot: matrix.code,
          templateVersionId: templateVersion.id,
          employeeId: dto.employeeId,
          contractId: dto.contractId,
          documentType: matrix.documentType,
          documentDate: dto.documentDate,
          effectiveDate: dto.effectiveDate,
          generatedBy,
          content: outcome.html,
          contentHash,
          tokens: {
            create: outcome.usedTokens.map((t) => ({
              tokenCode: t.code,
              rawValue: t.raw == null ? null : String(t.raw).slice(0, 500),
              formattedValue: t.formatted?.slice(0, 500),
            })),
          },
        },
        include,
      });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  findAll(filters: { employeeId?: string; matrixId?: string; status?: string }) {
    return this.prisma.generatedDocument.findMany({
      where: {
        employeeId: filters.employeeId,
        matrixId: filters.matrixId,
        status: filters.status as 'GENERATED' | 'CANCELLED' | undefined,
      },
      include,
      orderBy: { generatedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const doc = await this.prisma.generatedDocument.findUnique({ where: { id }, include });
    if (!doc) throw new NotFoundException('Documento no encontrado');
    return doc;
  }

  async cancel(id: string, dto: CancelDocumentDto, cancelledBy?: string) {
    const doc = await this.findOne(id);
    if (doc.status !== 'GENERATED') {
      throw new BadRequestException('Sólo se puede anular un documento en estado GENERADO');
    }
    return this.prisma.generatedDocument.update({
      where: { id },
      data: { status: 'CANCELLED', cancelledAt: new Date(), cancelledBy, cancelReason: dto.reason },
      include,
    });
  }
}
