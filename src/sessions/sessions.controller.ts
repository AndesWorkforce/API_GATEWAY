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

@Controller('sessions')
export class SessionsController {
  constructor(@Inject('USER_SERVICE') private readonly client: ClientProxy) {}

  @Post()
  create(@Body() createSessionDto: any) {
    return this.client.send('createSession', createSessionDto).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get()
  findAll() {
    return this.client.send('findAllSessionsList', {}).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get('active')
  findActiveSessions() {
    return this.client.send('findActiveSessions', {}).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.client.send('findSessionById', id).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.client.send('findSessionsByUserId', userId).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get('contractor/:contractorId')
  findByContractorId(@Param('contractorId') contractorId: string) {
    return this.client.send('findSessionsByContractorId', contractorId).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get('contractor/:contractorId/active')
  findActiveSessionByContractorId(@Param('contractorId') contractorId: string) {
    return this.client
      .send('findActiveSessionByContractorId', contractorId)
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSessionDto: any) {
    return this.client.send('updateSession', { id, updateSessionDto }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Patch(':id/end')
  endSession(@Param('id') id: string) {
    return this.client.send('endSession', id).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.client.send('removeSession', id).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }
}
