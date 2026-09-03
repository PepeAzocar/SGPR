import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateClauseDto } from './create-clause.dto.js';
import { OrgUnitStatus } from '../../generated/prisma/enums.js';

export class UpdateClauseDto extends PartialType(CreateClauseDto) {
  @IsOptional()
  @IsEnum(OrgUnitStatus)
  status?: OrgUnitStatus;
}
