import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

// Crea una nueva versión del perfil remuneracional APS de un contrato — nunca
// se edita una versión existente (ver ApsContractProfilesService.create).
export class CreateApsContractProfileDto {
  @IsString()
  categoryId: string;

  @IsInt()
  @Min(1)
  careerLevel: number;

  @IsString()
  facilityId: string;

  @IsInt()
  @Min(1)
  weeklyHours: number;

  @IsNumber()
  baseSalaryAmount: number;

  @IsOptional()
  @IsNumber()
  primaryCareAssignmentAmount?: number;

  @IsOptional()
  @IsNumber()
  zonePercentage?: number;

  @IsOptional()
  @IsNumber()
  zoneAmount?: number;

  @IsOptional()
  @IsNumber()
  difficultPerformancePercentage?: number;

  @IsOptional()
  @IsNumber()
  difficultPerformanceAmount?: number;

  @IsOptional()
  @IsNumber()
  responsibilityPercentage?: number;

  @IsOptional()
  @IsNumber()
  responsibilityAmount?: number;

  @IsOptional()
  @IsNumber()
  meritPercentage?: number;

  @IsOptional()
  @IsNumber()
  meritAmount?: number;

  @IsOptional()
  @IsNumber()
  specialAssignmentAmount?: number;

  @IsOptional()
  @IsNumber()
  postgraduateAssignmentAmount?: number;
}
