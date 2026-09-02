import { PartialType } from '@nestjs/mapped-types';
import { CreateDivisionDto } from './create-division.dto.js';

export class UpdateDivisionDto extends PartialType(CreateDivisionDto) {}
