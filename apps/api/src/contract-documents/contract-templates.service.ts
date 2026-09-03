import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateContractTemplateDto } from './dto/create-contract-template.dto.js';
import { UpdateContractTemplateDto } from './dto/update-contract-template.dto.js';
import { CreateTemplateVersionDto } from './dto/create-template-version.dto.js';
import { rethrowAsHttpError, rethrowDeleteConflict } from '../common/utils/prisma-error.util.js';
import { extractTemplateTokens, TemplateError } from './engine/template-engine.js';

const include = { versions: { orderBy: { versionNumber: 'desc' as const } } };

@Injectable()
export class ContractTemplatesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateContractTemplateDto, createdBy?: string) {
    try {
      return await this.prisma.contractTemplate.create({ data: { ...dto, createdBy }, include });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  findAll() {
    return this.prisma.contractTemplate.findMany({ include, orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const template = await this.prisma.contractTemplate.findUnique({ where: { id }, include });
    if (!template) throw new NotFoundException('Plantilla no encontrada');
    return template;
  }

  async update(id: string, dto: UpdateContractTemplateDto) {
    await this.findOne(id);
    try {
      return await this.prisma.contractTemplate.update({ where: { id }, data: dto, include });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.contractTemplate.delete({ where: { id } });
    } catch (err) {
      rethrowDeleteConflict(err, 'No se puede eliminar: la plantilla tiene versiones o matrices asociadas');
    }
  }

  private assertValidSyntax(content: string) {
    try {
      extractTemplateTokens(content);
    } catch (err) {
      if (err instanceof TemplateError) throw new BadRequestException(`Plantilla inválida: ${err.message}`);
      throw err;
    }
  }

  async createVersion(templateId: string, dto: CreateTemplateVersionDto, createdBy?: string) {
    await this.findOne(templateId);
    this.assertValidSyntax(dto.content);
    const last = await this.prisma.contractTemplateVersion.findFirst({
      where: { templateId },
      orderBy: { versionNumber: 'desc' },
    });
    const versionNumber = (last?.versionNumber ?? 0) + 1;
    return this.prisma.contractTemplateVersion.create({
      data: { ...dto, templateId, versionNumber, createdBy },
    });
  }

  async updateVersion(versionId: string, dto: CreateTemplateVersionDto) {
    const version = await this.findVersion(versionId);
    if (version.status !== 'DRAFT') {
      throw new BadRequestException('Sólo se puede editar una versión en estado BORRADOR; cree una nueva versión en su lugar');
    }
    this.assertValidSyntax(dto.content);
    return this.prisma.contractTemplateVersion.update({ where: { id: versionId }, data: dto });
  }

  private async findVersion(versionId: string) {
    const version = await this.prisma.contractTemplateVersion.findUnique({ where: { id: versionId } });
    if (!version) throw new NotFoundException('Versión de plantilla no encontrada');
    return version;
  }

  /** Publica la versión y cierra (RETIRED) la versión PUBLISHED anterior del mismo template. */
  async publishVersion(versionId: string, publishedBy?: string) {
    const version = await this.findVersion(versionId);
    if (version.status !== 'DRAFT') {
      throw new BadRequestException(`No se puede publicar una versión en estado "${version.status}"; debe estar en BORRADOR`);
    }
    return this.prisma.$transaction(async (tx) => {
      await tx.contractTemplateVersion.updateMany({
        where: { templateId: version.templateId, status: 'PUBLISHED', id: { not: versionId } },
        data: { status: 'RETIRED', validTo: version.validFrom ?? new Date() },
      });
      return tx.contractTemplateVersion.update({
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
    return this.prisma.contractTemplateVersion.update({
      where: { id: versionId },
      data: { status: 'RETIRED', validTo: new Date() },
    });
  }
}
