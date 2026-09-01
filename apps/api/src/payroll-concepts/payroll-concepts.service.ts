import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePayrollConceptDto } from './dto/create-payroll-concept.dto.js';
import { UpdatePayrollConceptDto } from './dto/update-payroll-concept.dto.js';

@Injectable()
export class PayrollConceptsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreatePayrollConceptDto) {
    return this.prisma.payrollConcept.create({ data: dto });
  }

  findAll() {
    return this.prisma.payrollConcept.findMany({ orderBy: { code: 'asc' } });
  }

  async findOne(id: string) {
    const concept = await this.prisma.payrollConcept.findUnique({ where: { id } });
    if (!concept) throw new NotFoundException('Concepto de remuneración no encontrado');
    return concept;
  }

  async update(id: string, dto: UpdatePayrollConceptDto) {
    await this.findOne(id);
    return this.prisma.payrollConcept.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.payrollConcept.delete({ where: { id } });
  }
}
