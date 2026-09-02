import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateBankDto {
  @IsString()
  @MaxLength(10)
  code: string;

  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  regulatorCode?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  effectiveFrom?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  effectiveTo?: Date;
}
