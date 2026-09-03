import { PartialType } from '@nestjs/mapped-types';
import { CreateApsProfessionDto } from './create-aps-profession.dto.js';

export class UpdateApsProfessionDto extends PartialType(CreateApsProfessionDto) {}
