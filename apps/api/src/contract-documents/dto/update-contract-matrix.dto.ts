import { PartialType } from '@nestjs/mapped-types';
import { CreateContractMatrixDto } from './create-contract-matrix.dto.js';

export class UpdateContractMatrixDto extends PartialType(CreateContractMatrixDto) {}
