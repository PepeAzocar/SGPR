import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCountryDto } from './dto/create-country.dto.js';
import { UpdateCountryDto } from './dto/update-country.dto.js';
import { rethrowAsHttpError, rethrowDeleteConflict } from '../common/utils/prisma-error.util.js';

@Injectable()
export class CountriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCountryDto) {
    try {
      return await this.prisma.country.create({ data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  findAll() {
    return this.prisma.country.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const country = await this.prisma.country.findUnique({ where: { id } });
    if (!country) throw new NotFoundException('País no encontrado');
    return country;
  }

  async update(id: string, dto: UpdateCountryDto) {
    await this.findOne(id);
    try {
      return await this.prisma.country.update({ where: { id }, data: dto });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.country.delete({ where: { id } });
    } catch (err) {
      rethrowDeleteConflict(err, 'No se puede eliminar: tiene regiones asociadas');
    }
  }
}
