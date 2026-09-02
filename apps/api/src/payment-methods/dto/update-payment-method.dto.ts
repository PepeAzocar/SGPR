import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentMethodDto } from './create-payment-method.dto.js';

export class UpdatePaymentMethodDto extends PartialType(CreatePaymentMethodDto) {}
