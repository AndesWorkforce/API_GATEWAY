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

import { getMessagePattern } from 'config';

@Controller('agent-sessions')
export class AgentSessionsController {
  constructor(@Inject('USER_SERVICE') private readonly client: ClientProxy) {}

  @Post()
  create(@Body() createAgentSessionDto: any) {
    return this.client
      .send(getMessagePattern('createAgentSession'), createAgentSessionDto)
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Get()
  findAll() {
    return this.client.send(getMessagePattern('findAllAgentSessions'), {}).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get('active')
  findActiveSessions() {
    return this.client
      .send(getMessagePattern('findActiveAgentSessions'), {})
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.client.send(getMessagePattern('findAgentSessionById'), id).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get('agent/:agentId')
  findByAgentId(@Param('agentId') agentId: string) {
    return this.client
      .send(getMessagePattern('findAgentSessionsByAgentId'), agentId)
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Get('agent/:agentId/active')
  findActiveSessionByAgentId(@Param('agentId') agentId: string) {
    return this.client
      .send(getMessagePattern('findActiveSessionByAgentId'), agentId)
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Get('contractor/:contractorId')
  findByContractorId(@Param('contractorId') contractorId: string) {
    return this.client
      .send(getMessagePattern('findAgentSessionsByContractorId'), contractorId)
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAgentSessionDto: any) {
    return this.client
      .send(getMessagePattern('updateAgentSession'), {
        id,
        updateAgentSessionDto,
      })
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Patch(':id/end')
  endSession(@Param('id') id: string) {
    return this.client.send(getMessagePattern('endAgentSession'), id).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.client.send(getMessagePattern('removeAgentSession'), id).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }
}
