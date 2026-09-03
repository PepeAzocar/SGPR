import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDocumentTokenDto } from './dto/create-document-token.dto.js';
import { UpdateDocumentTokenDto } from './dto/update-document-token.dto.js';
import { rethrowAsHttpError } from '../common/utils/prisma-error.util.js';

@Injectable()
export class DocumentTokensService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDocumentTokenDto) {
    try {
      return await this.prisma.documentTokenDefinition.create({ data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  findAll() {
    return this.prisma.documentTokenDefinition.findMany({ orderBy: [{ namespace: 'asc' }, { code: 'asc' }] });
  }

  async findOne(id: string) {
    const token = await this.prisma.documentTokenDefinition.findUnique({ where: { id } });
    if (!token) throw new NotFoundException('Token no encontrado');
    return token;
  }

  async update(id: string, dto: UpdateDocumentTokenDto) {
    await this.findOne(id);
    try {
      return await this.prisma.documentTokenDefinition.update({ where: { id }, data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.documentTokenDefinition.delete({ where: { id } });
  }
}
