import { Type } from 'class-transformer';
import { IsDate, IsString } from 'class-validator';

export class GenerateDocumentDto {
  @IsString()
  matrixId: string;

  @IsString()
  employeeId: string;

  @IsString()
  contractId: string;

  @IsDate()
  @Type(() => Date)
  documentDate: Date;

  @IsDate()
  @Type(() => Date)
  effectiveDate: Date;
}
