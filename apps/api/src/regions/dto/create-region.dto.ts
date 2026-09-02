import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateRegionDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  code?: string;

  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  countryId: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
