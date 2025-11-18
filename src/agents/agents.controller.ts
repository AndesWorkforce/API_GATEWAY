import { Controller, Get, Post, Body, Param, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Throttle } from '@nestjs/throttler';

import { Public } from 'src/decorators/public.decorator';

import {
  RegisterAgentDto,
  HeartbeatAgentDto,
  SwapAgentsDto,
} from './dto/agent.dto';
import { Role } from '../common/roles.enum';
import { Roles } from '../decorators/roles.decorator';

@Controller('agents')
export class AgentsController {
  constructor(@Inject('USER_SERVICE') private readonly client: ClientProxy) {}

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Public()
  @Post('register')
  registerAgent(@Body() registerDto: RegisterAgentDto) {
    return this.client.send('registerOrActivateAgent', registerDto);
  }
  @Public()
  @Post('heartbeat')
  heartbeatAgent(@Body() heartbeatDto: HeartbeatAgentDto) {
    return this.client.send('heartbeatAgent', heartbeatDto);
  }

  @Get('contractor/:contractorId')
  @Roles(Role.Superadmin, Role.Teamadmin)
  getContractorAgents(@Param('contractorId') contractorId: string) {
    return this.client.send('getContractorAgents', contractorId);
  }

  @Get('contractor/:contractorId/hierarchy')
  @Roles(Role.Superadmin, Role.Teamadmin)
  getAgentHierarchy(@Param('contractorId') contractorId: string) {
    return this.client.send('getAgentHierarchy', contractorId);
  }

  @Post('swap')
  @Roles(Role.Superadmin)
  swapAgentTypes(@Body() swapDto: SwapAgentsDto) {
    return this.client.send('swapAgentTypes', swapDto);
  }

  @Get()
  @Roles(Role.Superadmin, Role.Teamadmin)
  findAll() {
    return this.client.send('findAllAgents', {});
  }

  @Get(':id')
  @Roles(Role.Superadmin, Role.Teamadmin, Role.Client)
  findOne(@Param('id') id: string) {
    return this.client.send('findAgentById', id);
  }
}
