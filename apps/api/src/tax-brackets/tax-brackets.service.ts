import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTaxBracketDto } from './dto/create-tax-bracket.dto.js';
import { UpdateTaxBracketDto } from './dto/update-tax-bracket.dto.js';
import { rethrowAsHttpError } from '../common/utils/prisma-error.util.js';

@Injectable()
export class TaxBracketsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTaxBracketDto) {
    try {
      return await this.prisma.taxBracket.create({ data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  findAll() {
    return this.prisma.taxBracket.findMany({ orderBy: [{ validFrom: 'desc' }, { fromUtm: 'asc' }] });
  }

  async findOne(id: string) {
    const bracket = await this.prisma.taxBracket.findUnique({ where: { id } });
    if (!bracket) throw new NotFoundException('Tramo de impuesto no encontrado');
    return bracket;
  }

  async update(id: string, dto: UpdateTaxBracketDto) {
    await this.findOne(id);
    try {
      return await this.prisma.taxBracket.update({ where: { id }, data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.taxBracket.delete({ where: { id } });
  }
}
