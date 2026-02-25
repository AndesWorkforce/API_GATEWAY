import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateContractorDayOffDto {
  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  reason?: string;
}
