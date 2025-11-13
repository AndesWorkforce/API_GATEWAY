import { Controller, Get, Post, Body, Inject, Param, UseInterceptors } from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { Public } from '../decorators/public.decorator';

@Controller('events')
export class EventsController {
  constructor(@Inject('EVENTS_SERVICE') private readonly client: ClientProxy) {}

  @Get()
  async findAll() {
    return firstValueFrom(this.client.send('findEvents', {}));
  }

  @Public()
  @Get('contractor/:contractorId')
  async findByContractorId(@Param('contractorId') contractorId: string) {
    return firstValueFrom(this.client.send('findEventsByContractorId', contractorId));
  }

  @Get('session/:sessionId')
  async findBySessionId(@Param('sessionId') sessionId: string) {
    return firstValueFrom(this.client.send('findEventsBySessionId', sessionId));
  }

  @Get('agent/:agentId')
  async findByAgentId(@Param('agentId') agentId: string) {
    return firstValueFrom(this.client.send('findEventsByAgentId', agentId));
  }

  @Get('agent-session/:agentSessionId')
  async findByAgentSessionId(@Param('agentSessionId') agentSessionId: string) {
    return firstValueFrom(this.client.send('findEventsByAgentSessionId', agentSessionId));
  }
}
