import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateRegionDto } from './dto/create-region.dto.js';
import { UpdateRegionDto } from './dto/update-region.dto.js';
import { rethrowAsHttpError, rethrowDeleteConflict } from '../common/utils/prisma-error.util.js';

function withDisplayName<T extends { name: string; country: { name: string } }>(region: T) {
  return { ...region, displayName: `${region.name} — ${region.country.name}` };
}

@Injectable()
export class RegionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRegionDto) {
    try {
      return await this.prisma.region.create({ data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async findAll(countryId?: string) {
    const regions = await this.prisma.region.findMany({
      where: countryId ? { countryId } : undefined,
      include: { country: true },
      orderBy: { name: 'asc' },
    });
    return regions.map(withDisplayName);
  }

  async findOne(id: string) {
    const region = await this.prisma.region.findUnique({ where: { id }, include: { country: true } });
    if (!region) throw new NotFoundException('Región no encontrada');
    return withDisplayName(region);
  }

  async update(id: string, dto: UpdateRegionDto) {
    await this.findOne(id);
    try {
      return await this.prisma.region.update({ where: { id }, data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.region.delete({ where: { id } });
    } catch (err) {
      rethrowDeleteConflict(err, 'No se puede eliminar: tiene comunas asociadas');
    }
  }
}
