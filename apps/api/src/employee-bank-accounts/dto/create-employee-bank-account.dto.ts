import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsOptional, IsString, MaxLength } from 'class-validator';
import { IsRut } from '../../common/validators/is-rut.decorator.js';

export class CreateEmployeeBankAccountDto {
  @IsString()
  employeeId: string;

  @IsString()
  bankId: string;

  @IsString()
  accountTypeId: string;

  @IsString()
  paymentMethodId: string;

  @IsString()
  @MaxLength(30)
  accountNumber: string;

  @IsString()
  @MaxLength(150)
  accountHolderName: string;

  @IsRut()
  accountHolderRut: string;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currencyCode?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsDate()
  @Type(() => Date)
  effectiveFrom: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  effectiveTo?: Date;

  @IsOptional()
  @IsString()
  employeeEventId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
