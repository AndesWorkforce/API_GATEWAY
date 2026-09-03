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
   * Equipos (COMPUTERNAME) del contratista. Al instalarse, el agente reporta el
   * nombre de su maquina y se vincula solo al contratista que la tenga cargada.
   *
   * Un contratista puede tener varios equipos, pero cada equipo pertenece a uno
   * solo. Mandar [] desasigna todos; omitir la clave deja los actuales intactos.
   */
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  hostnames?: string[];

  /**
   * @deprecated Usar `hostnames`. Se mantiene para clientes anteriores a que un
   * contratista pudiera tener mas de un equipo; se trata como lista de uno.
   */
  @IsString()
  @IsOptional()
  hostname?: string;
}
