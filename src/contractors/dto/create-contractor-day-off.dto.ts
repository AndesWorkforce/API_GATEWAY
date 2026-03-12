import {
  IsArray,
  ArrayNotEmpty,
  IsDateString,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateContractorDayOffDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsDateString({}, { each: true })
  dates: string[];

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  reason: string;
}
