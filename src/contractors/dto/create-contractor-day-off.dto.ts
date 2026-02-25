import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateContractorDayOffDto {
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  reason: string;
}
