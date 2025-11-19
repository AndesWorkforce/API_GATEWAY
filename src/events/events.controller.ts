import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { Role } from 'src/common/enums/role.enum';
import { AllowClient, Roles } from 'src/decorators/roles.decorator';

import { Public } from '../decorators/public.decorator';

@Roles(Role.Superadmin, Role.TeamAdmin, Role.Visualizer)
@AllowClient()
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
    return firstValueFrom(
      this.client.send('findEventsByContractorId', contractorId),
    );
  }

  @Get('session/:sessionId')
  async findBySessionId(@Param('sessionId') sessionId: string) {
    return firstValueFrom(
      this.client.send('findEventsBySessionId', { sessionId }),
    );
  }

  @Get('agent/:agentId')
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
