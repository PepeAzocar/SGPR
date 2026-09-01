import {
  IsDate,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EmployeeStatus, Gender, MaritalStatus } from '../../generated/prisma/enums.js';
import { IsRut } from '../../common/validators/is-rut.decorator.js';

export class CreateEmployeeDto {
  @IsString()
  @MaxLength(20)
  documentType: string;

  @IsString()
  @MaxLength(30)
  documentNumber: string;

  // Condicional: solo se valida como RUT chileno cuando documentType = 'RUT'.
  @ValidateIf((dto) => dto.documentType === 'RUT')
  @IsRut()
  rut?: string;

  @IsString()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @MaxLength(100)
  lastName: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  secondLastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  socialName?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  birthDate?: Date;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsEnum(MaritalStatus)
  maritalStatus?: MaritalStatus;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  birthCountry?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  birthRegion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  birthCommune?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  photoUrl?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  commune?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  bankAccountType?: string;

  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;
}
