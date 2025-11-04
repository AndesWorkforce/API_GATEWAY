import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('agent-sessions')
export class AgentSessionsController {
  constructor(@Inject('USER_SERVICE') private readonly client: ClientProxy) {}

  @Post()
  create(@Body() createAgentSessionDto: any) {
    return this.client.send('createAgentSession', createAgentSessionDto);
  }

  @Get()
  findAll() {
    return this.client.send('findAllAgentSessions', {});
  }

  @Get('active')
  findActiveSessions() {
    return this.client.send('findActiveAgentSessions', {});
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.client.send('findAgentSessionById', id);
  }

  @Get('agent/:agentId')
  findByAgentId(@Param('agentId') agentId: string) {
    return this.client.send('findAgentSessionsByAgentId', agentId);
  }

  @Get('agent/:agentId/active')
  findActiveSessionByAgentId(@Param('agentId') agentId: string) {
    return this.client.send('findActiveSessionByAgentId', agentId);
  }

  @Get('contractor/:contractorId')
  findByContractorId(@Param('contractorId') contractorId: string) {
    return this.client.send('findAgentSessionsByContractorId', contractorId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAgentSessionDto: any) {
    return this.client.send('updateAgentSession', { id, updateAgentSessionDto });
  }

  @Patch(':id/end')
  endSession(@Param('id') id: string) {
    return this.client.send('endAgentSession', id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.client.send('removeAgentSession', id);
  }
}

