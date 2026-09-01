import { PartialType } from '@nestjs/mapped-types';
import { CreateEconomicIndicatorDto } from './create-economic-indicator.dto.js';

export class UpdateEconomicIndicatorDto extends PartialType(CreateEconomicIndicatorDto) {}
