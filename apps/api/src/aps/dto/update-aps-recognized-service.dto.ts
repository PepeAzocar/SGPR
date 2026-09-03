import { PartialType } from '@nestjs/mapped-types';
import { CreateApsRecognizedServiceDto } from './create-aps-recognized-service.dto.js';

export class UpdateApsRecognizedServiceDto extends PartialType(CreateApsRecognizedServiceDto) {}
