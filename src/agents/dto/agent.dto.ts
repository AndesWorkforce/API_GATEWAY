import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class RegisterAgentNoKeyDto {
  @IsString()
  @IsOptional()
  hostname?: string;
}

export class LinkAgentToContractorDto {
  @IsString()
  @IsNotEmpty()
  activation_key: string;

  @IsString()
  @IsNotEmpty()
  contractorId: string;
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
