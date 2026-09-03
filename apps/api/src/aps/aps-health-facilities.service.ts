import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateApsHealthFacilityDto } from './dto/create-aps-health-facility.dto.js';
import { UpdateApsHealthFacilityDto } from './dto/update-aps-health-facility.dto.js';
import { rethrowAsHttpError, rethrowDeleteConflict } from '../common/utils/prisma-error.util.js';

const include = {
  administrativeEntity: true,
  facilityType: true,
  commune: { include: { region: true } },
  healthService: true,
};

@Injectable()
export class ApsHealthFacilitiesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateApsHealthFacilityDto) {
    try {
      return await this.prisma.apsHealthFacility.create({ data: dto, include });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  findAll() {
    return this.prisma.apsHealthFacility.findMany({ include, orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const facility = await this.prisma.apsHealthFacility.findUnique({ where: { id }, include });
    if (!facility) throw new NotFoundException('Establecimiento no encontrado');
    return facility;
  }

  async update(id: string, dto: UpdateApsHealthFacilityDto) {
    await this.findOne(id);
    try {
      return await this.prisma.apsHealthFacility.update({ where: { id }, data: dto, include });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.apsHealthFacility.delete({ where: { id } });
    } catch (err) {
      rethrowDeleteConflict(err, 'No se puede eliminar: el establecimiento está en uso');
    }
  }
}
