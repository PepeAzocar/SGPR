import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateBankAccountTypeDto {
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
