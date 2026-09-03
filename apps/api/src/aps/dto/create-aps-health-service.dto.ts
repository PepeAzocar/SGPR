import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateApsHealthServiceDto {
  @IsString()
  @MaxLength(20)
  code: string;

  @IsString()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsString()
  regionId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
