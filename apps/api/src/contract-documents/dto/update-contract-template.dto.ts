import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateContractTemplateDto } from './create-contract-template.dto.js';
import { OrgUnitStatus } from '../../generated/prisma/enums.js';

export class UpdateContractTemplateDto extends PartialType(CreateContractTemplateDto) {
  @IsOptional()
  @IsEnum(OrgUnitStatus)
  status?: OrgUnitStatus;
}
