import { PartialType } from '@nestjs/mapped-types';
import { CreateMutualityDto } from './create-mutuality.dto.js';

export class UpdateMutualityDto extends PartialType(CreateMutualityDto) {}
