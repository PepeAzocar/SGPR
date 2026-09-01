import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTaxBracketDto } from './dto/create-tax-bracket.dto.js';
import { UpdateTaxBracketDto } from './dto/update-tax-bracket.dto.js';

@Injectable()
export class TaxBracketsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateTaxBracketDto) {
    return this.prisma.taxBracket.create({ data: dto });
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
    return this.prisma.taxBracket.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.taxBracket.delete({ where: { id } });
  }
}
