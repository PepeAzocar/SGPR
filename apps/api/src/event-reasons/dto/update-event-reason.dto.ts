import { PartialType } from '@nestjs/mapped-types';
import { CreateEventReasonDto } from './create-event-reason.dto.js';

export class UpdateEventReasonDto extends PartialType(CreateEventReasonDto) {}
