import { Controller, Get, Post, Body, Inject, Param } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { Public } from '../decorators/public.decorator';

@Controller('events')
export class EventsController {
  constructor(@Inject('EVENTS_SERVICE') private readonly client: ClientProxy) {}

  @Public()
  @Post()
  create(@Body() createEventDto: any) {
    return this.client.send('postEvent', createEventDto);
  }

  @Get()
  findAll() {
    return this.client.send('findEvents', {});
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.client.send('findEventsByUserId', userId);
  }

  @Get('session/:sessionId')
  findBySessionId(@Param('sessionId') sessionId: string) {
    return this.client.send('findEventsBySessionId', sessionId);
  }
}
