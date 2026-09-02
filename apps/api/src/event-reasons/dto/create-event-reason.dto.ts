import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateEventReasonDto {
  @IsString()
  @MaxLength(40)
  code: string;

  @IsString()
  @MaxLength(150)
  name: string;

  @IsString()
  eventTypeId: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
