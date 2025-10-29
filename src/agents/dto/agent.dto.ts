import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class RegisterAgentDto {
  @IsString()
  @IsNotEmpty()
  activationKey: string;

  @IsString()
  @IsOptional()
  hostname?: string;
}

export class HeartbeatAgentDto {
  @IsString()
  @IsNotEmpty()
  agentId: string;
}
