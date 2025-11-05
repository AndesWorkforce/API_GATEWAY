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

@Controller('sessions')
export class SessionsController {
  constructor(@Inject('USER_SERVICE') private readonly client: ClientProxy) {}

  @Post()
  create(@Body() createSessionDto: any) {
    return this.client.send('createSession', createSessionDto);
  }

  @Get()
  findAll() {
    return this.client.send('findAllSessions', {});
  }

  @Get('active')
  findActiveSessions() {
    return this.client.send('findActiveSessions', {});
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.client.send('findSessionById', id);
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.client.send('findSessionsByUserId', userId);
  }

  @Get('contractor/:contractorId')
  findByContractorId(@Param('contractorId') contractorId: string) {
    return this.client.send('findSessionsByContractorId', contractorId);
  }

  @Get('contractor/:contractorId/active')
  findActiveSessionByContractorId(@Param('contractorId') contractorId: string) {
    return this.client.send('findActiveSessionByContractorId', contractorId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSessionDto: any) {
    return this.client.send('updateSession', { id, updateSessionDto });
  }

  @Patch(':id/end')
  endSession(@Param('id') id: string) {
    return this.client.send('endSession', id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.client.send('removeSession', id);
  }
}
