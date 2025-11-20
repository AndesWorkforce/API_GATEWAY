import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';

import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(@Inject('USER_SERVICE') private readonly client: ClientProxy) {}

  @Get()
  findAll(@CurrentUser() _user: unknown) {
    return this.client.send('findAllUsers', {}).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.client.send('findUserById', id).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: Record<string, unknown>,
  ) {
    return this.client.send('updateUser', { id, data: updateUserDto }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.client.send('removeUser', id).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }
}
