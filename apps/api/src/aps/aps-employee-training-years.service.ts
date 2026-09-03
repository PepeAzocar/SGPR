import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateApsEmployeeTrainingYearDto } from './dto/create-aps-employee-training-year.dto.js';
import { UpdateApsEmployeeTrainingYearDto } from './dto/update-aps-employee-training-year.dto.js';
import { CreateEmployeeApsTrainingDto } from './dto/create-employee-aps-training.dto.js';
import { UpdateEmployeeApsTrainingDto } from './dto/update-employee-aps-training.dto.js';
import { rethrowAsHttpError, rethrowDeleteConflict } from '../common/utils/prisma-error.util.js';

const employeeSelect = { id: true, firstName: true, lastName: true, secondLastName: true, rut: true };

const include = {
  employee: { select: employeeSelect },
  trainings: {
    include: { trainingActivity: { include: { trainingType: true, technicalLevel: true } } },
    orderBy: { registrationDate: 'asc' as const },
  },
};

// Maestro-detalle: ApsEmployeeTrainingYear es el control anual (maestro);
// EmployeeApsTraining son los cursos tomados ese año (detalle) — ver
// docs/ley-19378-modelo-fisico.md sección 7.
@Injectable()
export class ApsEmployeeTrainingYearsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateApsEmployeeTrainingYearDto) {
    try {
      return await this.prisma.apsEmployeeTrainingYear.create({ data: dto, include });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  findAll(employeeId?: string) {
    return this.prisma.apsEmployeeTrainingYear.findMany({
      where: employeeId ? { employeeId } : undefined,
      include,
      orderBy: [{ employeeId: 'asc' }, { year: 'desc' }],
    });
  }

  async findOne(id: string) {
    const year = await this.prisma.apsEmployeeTrainingYear.findUnique({ where: { id }, include });
    if (!year) throw new NotFoundException('Control anual de capacitación no encontrado');
    return year;
  }

  async update(id: string, dto: UpdateApsEmployeeTrainingYearDto) {
    await this.findOne(id);
    try {
      return await this.prisma.apsEmployeeTrainingYear.update({ where: { id }, data: dto, include });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    // onDelete: Cascade en EmployeeApsTraining.trainingYear — borra también el detalle.
    return this.prisma.apsEmployeeTrainingYear.delete({ where: { id } });
  }

  async addTraining(trainingYearId: string, dto: CreateEmployeeApsTrainingDto) {
    const year = await this.findOne(trainingYearId);
    try {
      return await this.prisma.employeeApsTraining.create({
        data: { ...dto, employeeId: year.employeeId, trainingYearId },
        include: { trainingActivity: true },
      });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async updateTraining(trainingYearId: string, trainingId: string, dto: UpdateEmployeeApsTrainingDto) {
    const training = await this.prisma.employeeApsTraining.findUnique({ where: { id: trainingId } });
    if (!training || training.trainingYearId !== trainingYearId) {
      throw new NotFoundException('Curso no encontrado en este control anual');
    }
    try {
      return await this.prisma.employeeApsTraining.update({
        where: { id: trainingId },
        data: dto,
        include: { trainingActivity: true },
      });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async removeTraining(trainingYearId: string, trainingId: string) {
    const training = await this.prisma.employeeApsTraining.findUnique({ where: { id: trainingId } });
    if (!training || training.trainingYearId !== trainingYearId) {
      throw new NotFoundException('Curso no encontrado en este control anual');
    }
    return this.prisma.employeeApsTraining.delete({ where: { id: trainingId } });
  }
}
