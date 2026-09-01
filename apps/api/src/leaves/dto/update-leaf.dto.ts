import { PartialType } from '@nestjs/mapped-types';
import { CreateLeafDto } from './create-leaf.dto.js';

export class UpdateLeafDto extends PartialType(CreateLeafDto) {}
