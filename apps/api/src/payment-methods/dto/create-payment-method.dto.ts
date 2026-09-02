import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePaymentMethodDto {
  @IsString()
  @MaxLength(30)
  code: string;

  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
