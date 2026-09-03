import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateApsFacilityTypeDto {
  @IsString()
  @MaxLength(30)
  code: string; // CESFAM, CECOSF, POSTA_RURAL, SAPU, SAR, COSAM, CONSULTORIO, DIRECCION_SALUD, OTRO

  @IsString()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
