import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';

export class CreateClauseVersionDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  validFrom?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  validTo?: Date;
}
