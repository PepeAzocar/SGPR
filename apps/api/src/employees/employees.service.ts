import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateEmployeeDto } from './dto/create-employee.dto.js';
import { UpdateEmployeeDto } from './dto/update-employee.dto.js';

const currentAfpInclude = {
  afpAffiliations: {
    where: { status: 'ACTIVE' as const, effectiveTo: null },
    include: { afp: true },
    take: 1,
  },
  healthAffiliations: {
    where: { status: 'ACTIVE' as const, effectiveTo: null },
    include: { healthInstitution: true },
    take: 1,
  },
};

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateEmployeeDto) {
    return this.prisma.employee.create({ data: dto });
  }

  findAll() {
    // photoUrl es una imagen en base64 (potencialmente cientos de KB por
    // colaborador); se omite en el listado para no inflar la respuesta y
    // sólo se entrega completa en findOne() (ficha del colaborador).
    return this.prisma.employee.findMany({
      include: currentAfpInclude,
      omit: { photoUrl: true },
      orderBy: { lastName: 'asc' },
    });
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        ...currentAfpInclude,
        pensionSavings: { include: { institution: true }, orderBy: { effectiveFrom: 'desc' } },
        contracts: { include: { position: { include: { department: true } } } },
      },
    });
    if (!employee) throw new NotFoundException('Empleado no encontrado');
    return employee;
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    await this.findOne(id);
    return this.prisma.employee.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);

    const [contracts, leaves, payslips, afpAffiliations, healthAffiliations, pensionSavings, user] =
      await Promise.all([
        this.prisma.contract.count({ where: { employeeId: id } }),
        this.prisma.leave.count({ where: { employeeId: id } }),
        this.prisma.payslip.count({ where: { employeeId: id } }),
        this.prisma.employeeAfp.count({ where: { employeeId: id } }),
        this.prisma.healthAffiliation.count({ where: { employeeId: id } }),
        this.prisma.employeePensionSaving.count({ where: { employeeId: id } }),
        this.prisma.user.count({ where: { employeeId: id } }),
      ]);

    const blockers: string[] = [];
    if (contracts > 0) blockers.push(`${contracts} contrato(s)`);
    if (leaves > 0) blockers.push(`${leaves} ausencia(s)`);
    if (payslips > 0) blockers.push(`${payslips} liquidación(es)`);
    if (afpAffiliations > 0) blockers.push(`${afpAffiliations} afiliación(es) AFP`);
    if (healthAffiliations > 0) blockers.push(`${healthAffiliations} afiliación(es) de salud`);
    if (pensionSavings > 0) blockers.push(`${pensionSavings} producto(s) de ahorro previsional`);
    if (user > 0) blockers.push('1 usuario del sistema asociado');

    if (blockers.length > 0) {
      throw new ConflictException(
        `No se puede eliminar el empleado porque tiene registros asociados que deben conservarse: ${blockers.join(', ')}. ` +
          'Elimina o reasigna esos registros primero para mantener la integridad de los datos.',
      );
    }

    return this.prisma.employee.delete({ where: { id } });
  }
}
