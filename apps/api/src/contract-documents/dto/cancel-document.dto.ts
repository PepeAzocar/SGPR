import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CancelDocumentDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  reason?: string;
}
