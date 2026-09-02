import { Type } from 'class-transformer';
import { IsDate, IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';
import { IsRut } from '../../common/validators/is-rut.decorator.js';

export class CreateMutualityDto {
  @IsString()
  @MaxLength(20)
  code: string;

  @IsRut()
  rut: string;

  @IsString()
  @MaxLength(150)
  legalName: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  tradeName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  previredCode?: string;

  @IsOptional()
  isActive?: boolean;

  @IsDate()
  @Type(() => Date)
  effectiveFrom: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  effectiveTo?: Date;
}
