import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';

import { Public } from '../decorators/public.decorator';

@Controller('events')
export class EventsController {
  constructor(@Inject('EVENTS_SERVICE') private readonly client: ClientProxy) {}

  @Get()
  findAll() {
    return this.client.send('findEvents', {}).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Public()
  @Get('contractor/:contractorId')
  findByContractorId(@Param('contractorId') contractorId: string) {
    return this.client.send('findEventsByContractorId', contractorId).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get('session/:sessionId')
  findBySessionId(@Param('sessionId') sessionId: string) {
    return this.client.send('findEventsBySessionId', { sessionId }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get('agent/:agentId')
  findByAgentId(@Param('agentId') agentId: string) {
    return this.client.send('findEventsByAgentId', agentId).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get('agent-session/:agentSessionId')
  findByAgentSessionId(@Param('agentSessionId') agentSessionId: string) {
    return this.client.send('findEventsByAgentSessionId', agentSessionId).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }
}
