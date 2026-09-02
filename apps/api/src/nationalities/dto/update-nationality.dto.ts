import { PartialType } from '@nestjs/mapped-types';
import { CreateNationalityDto } from './create-nationality.dto.js';

export class UpdateNationalityDto extends PartialType(CreateNationalityDto) {}
