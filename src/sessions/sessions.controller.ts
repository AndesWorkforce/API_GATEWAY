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

import { Role } from '../common/roles.enum';
import { Roles } from '../decorators/roles.decorator';

@Controller('sessions')
export class SessionsController {
  constructor(@Inject('USER_SERVICE') private readonly client: ClientProxy) {}

  @Post()
  @Roles(Role.Superadmin, Role.Teamadmin, Role.Client)
  create(@Body() createSessionDto: unknown) {
    return this.client.send('createSession', createSessionDto);
  }

  @Get()
  @Roles(Role.Superadmin, Role.Teamadmin)
  findAll() {
    return this.client.send('findAllSessions', {});
  }

  @Get('active')
  @Roles(Role.Superadmin, Role.Teamadmin)
  findActiveSessions() {
    return this.client.send('findActiveSessions', {});
  }

  @Get(':id')
  @Roles(Role.Superadmin, Role.Teamadmin, Role.Client)
  findOne(@Param('id') id: string) {
    return this.client.send('findSessionById', id);
  }

  @Get('user/:userId')
  @Roles(Role.Superadmin, Role.Teamadmin, Role.Client)
  findByUserId(@Param('userId') userId: string) {
    return this.client.send('findSessionsByUserId', userId);
  }

  @Get('contractor/:contractorId')
  @Roles(Role.Superadmin, Role.Teamadmin)
  findByContractorId(@Param('contractorId') contractorId: string) {
    return this.client.send('findSessionsByContractorId', contractorId);
  }

  @Get('contractor/:contractorId/active')
  @Roles(Role.Superadmin, Role.Teamadmin)
  findActiveSessionByContractorId(@Param('contractorId') contractorId: string) {
    return this.client.send('findActiveSessionByContractorId', contractorId);
  }

  @Patch(':id')
  @Roles(Role.Superadmin, Role.Teamadmin)
  update(@Param('id') id: string, @Body() updateSessionDto: unknown) {
    return this.client.send('updateSession', { id, updateSessionDto });
  }

  @Patch(':id/end')
  @Roles(Role.Superadmin, Role.Teamadmin)
  endSession(@Param('id') id: string) {
    return this.client.send('endSession', id);
  }

  @Delete(':id')
  @Roles(Role.Superadmin, Role.Teamadmin)
  remove(@Param('id') id: string) {
    return this.client.send('removeSession', id);
  }
}
