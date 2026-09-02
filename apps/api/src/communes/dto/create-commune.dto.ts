import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCommuneDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  code?: string;

  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  regionId: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
