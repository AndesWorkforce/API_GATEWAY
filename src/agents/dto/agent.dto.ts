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

export class SwapAgentsDto {
  @IsString()
  @IsNotEmpty()
  agent1_id: string;

  @IsString()
  @IsNotEmpty()
  agent2_id: string;
}