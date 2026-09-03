import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateApsContractProfileDto } from './dto/create-aps-contract-profile.dto.js';
import { rethrowAsHttpError } from '../common/utils/prisma-error.util.js';

const include = { category: true, facility: { include: { commune: true } } };

function sum(...values: (number | null | undefined)[]): number {
  return values.reduce((acc: number, v) => acc + (v ? Number(v) : 0), 0);
}

// Perfil remuneracional APS del contrato — puente hacia Nómina (ver
// docs/ley-19378-modelo-fisico.md sección 13). Nunca se edita una versión:
// cada cambio crea una nueva versión y cierra (SUPERSEDED) la anterior, igual
// que PayrollFormula y ContractTemplateVersion.
@Injectable()
export class ApsContractProfilesService {
  constructor(private prisma: PrismaService) {}

  private async assertApsContract(contractId: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: { laborRegime: true },
    });
    if (!contract) throw new NotFoundException('Contrato no encontrado');
    if (contract.laborRegime.code !== 'LEY_19378') {
      throw new BadRequestException(
        'El perfil remuneracional APS sólo aplica a contratos bajo el Estatuto de Atención Primaria de Salud Municipal (Ley N°19.378)',
      );
    }
    return contract;
  }

  async findCurrent(contractId: string) {
    await this.assertApsContract(contractId);
    const profile = await this.prisma.apsContractProfile.findFirst({
      where: { contractId, status: 'ACTIVE' },
      include,
      orderBy: { version: 'desc' },
    });
    if (!profile) throw new NotFoundException('El contrato aún no tiene un perfil remuneracional APS');
    return profile;
  }

  history(contractId: string) {
    return this.prisma.apsContractProfile.findMany({
      where: { contractId },
      include,
      orderBy: { version: 'desc' },
    });
  }

  async create(contractId: string, dto: CreateApsContractProfileDto) {
    await this.assertApsContract(contractId);

    const totalApsAssignments = sum(
      dto.primaryCareAssignmentAmount,
      dto.zoneAmount,
      dto.difficultPerformanceAmount,
      dto.responsibilityAmount,
      dto.meritAmount,
      dto.specialAssignmentAmount,
      dto.postgraduateAssignmentAmount,
    );

    try {
      return await this.prisma.$transaction(async (tx) => {
        const previous = await tx.apsContractProfile.findFirst({
          where: { contractId, status: 'ACTIVE' },
          orderBy: { version: 'desc' },
        });

        const now = new Date();
        if (previous) {
          await tx.apsContractProfile.update({
            where: { id: previous.id },
            data: { status: 'SUPERSEDED', effectiveTo: now },
          });
        }

        return tx.apsContractProfile.create({
          data: {
            ...dto,
            contractId,
            totalApsAssignments,
            version: (previous?.version ?? 0) + 1,
            status: 'ACTIVE',
            effectiveFrom: now,
          },
          include,
        });
      });
    } catch (err) {
      rethrowAsHttpError(err);
    }
  }
}
