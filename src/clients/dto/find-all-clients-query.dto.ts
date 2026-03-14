import { IsOptional, IsString } from 'class-validator';

export class FindAllClientsQueryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  teamId?: string;
}
