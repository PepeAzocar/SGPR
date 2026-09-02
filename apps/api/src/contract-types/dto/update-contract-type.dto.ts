import { PartialType } from '@nestjs/mapped-types';
import { CreateContractTypeDto } from './create-contract-type.dto.js';

export class UpdateContractTypeDto extends PartialType(CreateContractTypeDto) {}
