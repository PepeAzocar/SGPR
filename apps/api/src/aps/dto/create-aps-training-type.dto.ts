import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateApsTrainingTypeDto {
  @IsString()
  @MaxLength(30)
  code: string; // COURSE / INTERNSHIP / WORKSHOP / SEMINAR / DIPLOMA / SPECIALIZATION / MISSION_STUDY / CONGRESS / OTHER

  @IsString()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
