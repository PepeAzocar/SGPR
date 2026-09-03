import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsIn, IsInt, IsOptional, IsString, Min, MaxLength } from 'class-validator';

export const DOCUMENT_TYPES = ['CONTRATO', 'ANEXO', 'CERTIFICADO'] as const;

export class CreateContractMatrixDto {
  @IsString()
  @MaxLength(80)
  code: string;

  @IsString()
  @MaxLength(200)
  name: string;

  @IsIn(DOCUMENT_TYPES)
  documentType: (typeof DOCUMENT_TYPES)[number];

  @IsOptional()
  @IsString()
  legalRegimeId?: string;

  @IsOptional()
  @IsString()
  contractTypeId?: string;

  @IsString()
  templateId: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: number;

  @IsOptional()
  @IsBoolean()
  automaticGeneration?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresSignature?: boolean;

  @IsDate()
  @Type(() => Date)
  validFrom: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  validTo?: Date;
}
