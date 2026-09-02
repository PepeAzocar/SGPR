import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateNationalityDto {
  @IsOptional()
  @IsString()
  @MaxLength(10)
  code?: string;

  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
