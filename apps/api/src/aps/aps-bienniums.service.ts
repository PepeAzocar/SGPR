import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateApsBienniumDto } from './dto/create-aps-biennium.dto.js';
import { UpdateApsBienniumDto } from './dto/update-aps-biennium.dto.js';
import { CreateApsRecognizedServiceDto } from './dto/create-aps-recognized-service.dto.js';
import { UpdateApsRecognizedServiceDto } from './dto/update-aps-recognized-service.dto.js';
import { CreateApsServiceExclusionDto } from './dto/create-aps-service-exclusion.dto.js';
import { rethrowAsHttpError, rethrowDeleteConflict } from '../common/utils/prisma-error.util.js';

const employeeSelect = { id: true, firstName: true, lastName: true, secondLastName: true, rut: true };

const include = {
  employee: { select: employeeSelect },
  recognizedServices: {
    include: { institution: true, exclusions: true },
    orderBy: { startDate: 'asc' as const },
  },
};

// Maestro-detalle de "Control Bienal": ApsBiennium es el maestro (un bienio
// en curso o reconocido); ApsRecognizedService es el detalle (cada período de
// servicio que aporta días a ese bienio); ApsServiceExclusion es un tercer
// nivel, anidado bajo cada servicio (licencias sin goce, interrupciones que
// no cuentan). Ver docs/ley-19378-modelo-fisico.md sección 6.
@Injectable()
export class ApsBienniumsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateApsBienniumDto) {
    try {
      return await this.prisma.apsBiennium.create({ data: dto, include });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  findAll(employeeId?: string) {
    return this.prisma.apsBiennium.findMany({
      where: employeeId ? { employeeId } : undefined,
      include,
      orderBy: [{ employeeId: 'asc' }, { bienniumNumber: 'asc' }],
    });
  }

  async findOne(id: string) {
    const biennium = await this.prisma.apsBiennium.findUnique({ where: { id }, include });
    if (!biennium) throw new NotFoundException('Bienio no encontrado');
    return biennium;
  }

  async update(id: string, dto: UpdateApsBienniumDto) {
    await this.findOne(id);
    try {
      return await this.prisma.apsBiennium.update({ where: { id }, data: dto, include });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.apsBiennium.delete({ where: { id } });
    } catch (err) {
      rethrowDeleteConflict(err, 'No se puede eliminar: tiene servicios reconocidos asociados');
    }
  }

  async addService(bienniumId: string, dto: CreateApsRecognizedServiceDto) {
    const biennium = await this.findOne(bienniumId);
    try {
      return await this.prisma.apsRecognizedService.create({
        data: { ...dto, employeeId: biennium.employeeId, bienniumId },
        include: { institution: true, exclusions: true },
      });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  private async getServiceOrThrow(bienniumId: string, serviceId: string) {
    const service = await this.prisma.apsRecognizedService.findUnique({ where: { id: serviceId } });
    if (!service || service.bienniumId !== bienniumId) {
      throw new NotFoundException('Servicio reconocido no encontrado en este bienio');
    }
    return service;
  }

  async updateService(bienniumId: string, serviceId: string, dto: UpdateApsRecognizedServiceDto) {
    await this.getServiceOrThrow(bienniumId, serviceId);
    try {
      return await this.prisma.apsRecognizedService.update({
        where: { id: serviceId },
        data: dto,
        include: { institution: true, exclusions: true },
      });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async removeService(bienniumId: string, serviceId: string) {
    await this.getServiceOrThrow(bienniumId, serviceId);
    // onDelete: Cascade en ApsServiceExclusion.service — borra también sus exclusiones.
    return this.prisma.apsRecognizedService.delete({ where: { id: serviceId } });
  }

  async addExclusion(bienniumId: string, serviceId: string, dto: CreateApsServiceExclusionDto) {
    const service = await this.getServiceOrThrow(bienniumId, serviceId);
    try {
      return await this.prisma.apsServiceExclusion.create({
        data: { ...dto, employeeId: service.employeeId, serviceId },
      });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async removeExclusion(bienniumId: string, serviceId: string, exclusionId: string) {
    await this.getServiceOrThrow(bienniumId, serviceId);
    const exclusion = await this.prisma.apsServiceExclusion.findUnique({ where: { id: exclusionId } });
    if (!exclusion || exclusion.serviceId !== serviceId) {
      throw new NotFoundException('Exclusión no encontrada en este servicio');
    }
    return this.prisma.apsServiceExclusion.delete({ where: { id: exclusionId } });
  }
}
