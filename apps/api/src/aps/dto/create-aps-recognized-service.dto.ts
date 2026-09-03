import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsIn, IsInt, IsOptional, IsString, Min, MaxLength } from 'class-validator';

const STATUSES = ['PENDING', 'RECOGNIZED', 'REJECTED'] as const;

// Detalle anidado bajo ApsBiennium — employeeId y bienniumId los completa el
// service a partir del maestro (:id de la ruta), no van en el body.
export class CreateApsRecognizedServiceDto {
  @IsString()
  institutionId: string;

  @IsString()
  @MaxLength(40)
  serviceType: string; // TITULAR, CONTRATA, HONORARIOS, SUPLENCIA

  @IsOptional()
  @IsString()
  @MaxLength(40)
  legalRelationship?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  positionName?: string;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @IsInt()
  @Min(0)
  calendarDays: number;

  @IsInt()
  @Min(0)
  recognizedDays: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  excludedDays?: number;

  @IsOptional()
  @IsBoolean()
  apsService?: boolean;

  @IsOptional()
  @IsBoolean()
  publicService?: boolean;

  @IsOptional()
  @IsBoolean()
  municipalService?: boolean;

  @IsOptional()
  @IsBoolean()
  recognized?: boolean;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  recognitionDate?: Date;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  resolutionNumber?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  resolutionDate?: Date;

  @IsOptional()
  @IsString()
  documentId?: string;

  @IsDate()
  @Type(() => Date)
  effectiveFrom: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  effectiveTo?: Date;

  @IsOptional()
  @IsIn(STATUSES)
  status?: (typeof STATUSES)[number];
}
