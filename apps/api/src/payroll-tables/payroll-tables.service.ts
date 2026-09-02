import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePayrollTableDto } from './dto/create-payroll-table.dto.js';
import { UpdatePayrollTableDto } from './dto/update-payroll-table.dto.js';
import { CreatePayrollTableRowDto } from './dto/create-payroll-table-row.dto.js';
import { rethrowAsHttpError, rethrowDeleteConflict } from '../common/utils/prisma-error.util.js';

const include = { rows: { orderBy: { fromValue: 'asc' as const } } };

@Injectable()
export class PayrollTablesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePayrollTableDto) {
    try {
      return await this.prisma.payrollTable.create({ data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  findAll() {
    return this.prisma.payrollTable.findMany({ include, orderBy: { code: 'asc' } });
  }

  async findOne(id: string) {
    const table = await this.prisma.payrollTable.findUnique({ where: { id }, include });
    if (!table) throw new NotFoundException('Tabla no encontrada');
    return table;
  }

  async update(id: string, dto: UpdatePayrollTableDto) {
    await this.findOne(id);
    try {
      return await this.prisma.payrollTable.update({ where: { id }, data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.payrollTable.delete({ where: { id } });
    } catch (err) {
      rethrowDeleteConflict(err, 'No se puede eliminar: la tabla está en uso');
    }
  }

  async addRow(tableId: string, dto: CreatePayrollTableRowDto) {
    await this.findOne(tableId);
    try {
      return await this.prisma.payrollTableRow.create({ data: { ...dto, tableId } });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async removeRow(tableId: string, rowId: string) {
    const row = await this.prisma.payrollTableRow.findUnique({ where: { id: rowId } });
    if (!row || row.tableId !== tableId) throw new NotFoundException('Tramo no encontrado');
    return this.prisma.payrollTableRow.delete({ where: { id: rowId } });
  }
}
