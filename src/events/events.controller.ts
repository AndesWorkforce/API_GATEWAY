import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { Role } from '../common/roles.enum';
import { Public } from '../decorators/public.decorator';
import { Roles } from '../decorators/roles.decorator';

@Controller('events')
export class EventsController {
  constructor(@Inject('EVENTS_SERVICE') private readonly client: ClientProxy) {}

  @Get()
  @Roles(Role.Superadmin, Role.Teamadmin, Role.Visualizer)
  async findAll() {
    return firstValueFrom(this.client.send('findEvents', {}));
  }

  @Public()
  @Get('contractor/:contractorId')
  async findByContractorId(@Param('contractorId') contractorId: string) {
    return firstValueFrom(
      this.client.send('findEventsByContractorId', contractorId),
    );
  }

  @Get('session/:sessionId')
  @Roles(Role.Superadmin, Role.Teamadmin, Role.Visualizer)
  async findBySessionId(@Param('sessionId') sessionId: string) {
    return firstValueFrom(this.client.send('findEventsBySessionId', sessionId));
  }

  @Get('agent/:agentId')
  @Roles(Role.Superadmin, Role.Teamadmin, Role.Client)
  async findByAgentId(@Param('agentId') agentId: string) {
    return firstValueFrom(this.client.send('findEventsByAgentId', agentId));
  }

  @Get('agent-session/:agentSessionId')
  async findByAgentSessionId(@Param('agentSessionId') agentSessionId: string) {
    return firstValueFrom(
      this.client.send('findEventsByAgentSessionId', agentSessionId),
    );
  }
}
