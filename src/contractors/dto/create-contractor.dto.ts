import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateContractorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  job_position?: string;

  @IsString()
  @IsOptional()
  work_schedule_start?: string;

  @IsString()
  @IsOptional()
  work_schedule_end?: string;

  @IsString()
  @IsOptional()
  lunch_start?: string;

  @IsString()
  @IsOptional()
  lunch_end?: string;

  @IsArray()
  @IsOptional()
  lunch_time?: [string, string];

  @IsString()
  @IsOptional()
  country?: string;

  @IsEnum(['full_time', 'part_time', 'no_schedule'])
  @IsOptional()
  job_schedule?: 'full_time' | 'part_time' | 'no_schedule';

  @IsString()
  @IsNotEmpty()
  client_id: string;

  @IsString()
  @IsOptional()
  team_id?: string;

  /**
   * Hostname (COMPUTERNAME) del equipo asignado. Al instalarse, el agente reporta
   * el nombre de su máquina y se vincula solo al contratista que lo tenga cargado.
   * Mandar '' desasigna el equipo.
   */
  @IsString()
  @IsOptional()
  hostname?: string;
}
