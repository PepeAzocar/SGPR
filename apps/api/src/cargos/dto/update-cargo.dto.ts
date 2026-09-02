import { PartialType } from '@nestjs/mapped-types';
import { CreateCargoDto } from './create-cargo.dto.js';

export class UpdateCargoDto extends PartialType(CreateCargoDto) {}
