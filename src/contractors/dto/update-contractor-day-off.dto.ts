import {
  IsArray,
  ArrayNotEmpty,
  IsDateString,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateContractorDayOffDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsDateString({}, { each: true })
  @IsOptional()
  dates?: string[];

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  reason?: string;
}
