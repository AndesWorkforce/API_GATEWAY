import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class RegisterAgentNoKeyDto {
  /**
   * Hostname (COMPUTERNAME) del equipo, leído por el agente al instalarse.
   * Si matchea con Contractor.hostname, el agente se vincula solo.
   */
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

  @IsString()
  @IsOptional()
  power_state?: string;
}

export class ReportAgentHostnameDto {
  @IsString()
  @IsNotEmpty()
  agentId: string;

  @IsString()
  @IsNotEmpty()
  hostname: string;
}

export class DecommissionAgentDto {
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
