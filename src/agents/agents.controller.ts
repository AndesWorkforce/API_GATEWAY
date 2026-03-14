import { Controller, Get, Post, Body, Param, Inject } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { Throttle } from '@nestjs/throttler';
import { catchError } from 'rxjs';

import { envs, getMessagePattern } from 'config';
import { Role } from 'src/common/enums/role.enum';
import { Public } from 'src/decorators/public.decorator';
import { AllowClient, Roles } from 'src/decorators/roles.decorator';

import {
  RegisterAgentNoKeyDto,
  LinkAgentToContractorDto,
  HeartbeatAgentDto,
  SwapAgentsDto,
} from './dto/agent.dto';

@Roles(Role.Superadmin, Role.TeamAdmin, Role.Visualizer)
@AllowClient()
@Controller('agents')
export class AgentsController {
  constructor(@Inject('USER_SERVICE') private readonly client: ClientProxy) {}

  @Throttle({
    default: {
      limit: envs.throttle.agent.register.limit,
      ttl: envs.throttle.agent.register.ttl,
    },
  })
  @Public()
  @Post('register')
  registerAgent(@Body() registerDto: RegisterAgentNoKeyDto) {
    return this.client
      .send(getMessagePattern('registerAgent'), registerDto)
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Roles(Role.Superadmin, Role.TeamAdmin)
  @Post('link')
  linkAgentToContractor(@Body() dto: LinkAgentToContractorDto) {
    return this.client
      .send(getMessagePattern('linkAgentToContractor'), dto)
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Throttle({
    default: {
      limit: envs.throttle.agent.heartbeat.limit,
      ttl: envs.throttle.agent.heartbeat.ttl,
    },
  })
  @Public()
  @Post('heartbeat')
  heartbeatAgent(@Body() heartbeatDto: HeartbeatAgentDto) {
    return this.client
      .send(getMessagePattern('heartbeatAgent'), heartbeatDto)
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Get('contractor/:contractorId')
  getContractorAgents(@Param('contractorId') contractorId: string) {
    return this.client
      .send(getMessagePattern('getContractorAgents'), contractorId)
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Get('contractor/:contractorId/hierarchy')
  getAgentHierarchy(@Param('contractorId') contractorId: string) {
    return this.client
      .send(getMessagePattern('getAgentHierarchy'), contractorId)
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Roles(Role.Superadmin, Role.TeamAdmin)
  @Post('swap')
  swapAgentTypes(@Body() swapDto: SwapAgentsDto) {
    return this.client.send(getMessagePattern('swapAgentTypes'), swapDto).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get()
  findAll() {
    return this.client.send(getMessagePattern('findAllAgents'), {}).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Roles(Role.Superadmin, Role.TeamAdmin)
  @Get('unlinked')
  findUnlinked() {
    return this.client.send(getMessagePattern('findUnlinkedAgents'), {}).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.client.send(getMessagePattern('findAgentById'), id).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }
}
