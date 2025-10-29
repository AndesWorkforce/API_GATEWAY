import { Controller, Get, Post, Body, Param, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { RegisterAgentDto, HeartbeatAgentDto } from './dto/agent.dto';

@Controller('agents')
export class AgentsController {
  constructor(@Inject('USER_SERVICE') private readonly client: ClientProxy) {}

  @Post('register')
  registerAgent(@Body() registerDto: RegisterAgentDto) {
    return this.client.send('registerOrActivateAgent', registerDto);
  }

  @Post('heartbeat')
  heartbeatAgent(@Body() heartbeatDto: HeartbeatAgentDto) {
    return this.client.send('heartbeatAgent', heartbeatDto);
  }

  @Get('contractor/:contractorId')
  getContractorAgents(@Param('contractorId') contractorId: string) {
    return this.client.send('getContractorAgents', contractorId);
  }

  @Get('contractor/:contractorId/hierarchy')
  getAgentHierarchy(@Param('contractorId') contractorId: string) {
    return this.client.send('getAgentHierarchy', contractorId);
  }

  @Get()
  findAll() {
    return this.client.send('findAllAgents', {});
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.client.send('findAgentById', id);
  }
}
