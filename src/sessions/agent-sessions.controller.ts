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
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';

@Controller('agent-sessions')
export class AgentSessionsController {
  constructor(@Inject('USER_SERVICE') private readonly client: ClientProxy) {}

  @Post()
  create(@Body() createAgentSessionDto: any) {
    return this.client.send('createAgentSession', createAgentSessionDto).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get()
  findAll() {
    return this.client.send('findAllAgentSessions', {}).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get('active')
  findActiveSessions() {
    return this.client.send('findActiveAgentSessions', {}).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.client.send('findAgentSessionById', id).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get('agent/:agentId')
  findByAgentId(@Param('agentId') agentId: string) {
    return this.client.send('findAgentSessionsByAgentId', agentId).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get('agent/:agentId/active')
  findActiveSessionByAgentId(@Param('agentId') agentId: string) {
    return this.client.send('findActiveSessionByAgentId', agentId).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get('contractor/:contractorId')
  findByContractorId(@Param('contractorId') contractorId: string) {
    return this.client
      .send('findAgentSessionsByContractorId', contractorId)
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAgentSessionDto: any) {
    return this.client
      .send('updateAgentSession', { id, updateAgentSessionDto })
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Patch(':id/end')
  endSession(@Param('id') id: string) {
    return this.client.send('endAgentSession', id).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.client.send('removeAgentSession', id).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }
}
