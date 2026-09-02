import { PartialType } from '@nestjs/mapped-types';
import { CreateBusinessUnitDto } from './create-business-unit.dto.js';

export class UpdateBusinessUnitDto extends PartialType(CreateBusinessUnitDto) {}
