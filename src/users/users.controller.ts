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

import { getMessagePattern } from 'config';
import { Role } from 'src/common/enums/role.enum';
import { Roles } from 'src/decorators/roles.decorator';

import { CurrentUser } from '../decorators/current-user.decorator';

@Roles(Role.Superadmin, Role.TeamAdmin, Role.Visualizer)
@Controller('users')
export class UsersController {
  constructor(@Inject('USER_SERVICE') private readonly client: ClientProxy) {}

  @Get()
  findAll(@CurrentUser() _user: unknown) {
    return this.client.send(getMessagePattern('findAllUsers'), {}).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get('stats')
  getStats() {
    return this.client.send(getMessagePattern('getStats'), {}).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.client.send(getMessagePattern('findUserById'), id).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }
  @Roles(Role.Superadmin)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: Record<string, unknown>,
  ) {
    return this.client
      .send(getMessagePattern('updateUser'), { id, data: updateUserDto })
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Roles(Role.Superadmin)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.client.send(getMessagePattern('removeUser'), id).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }
}
