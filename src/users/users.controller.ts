import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { Role } from 'src/common/enums/role.enum';
import { Roles } from 'src/decorators/roles.decorator';

import { CurrentUser } from '../decorators/current-user.decorator';

@Roles(Role.Superadmin, Role.TeamAdmin, Role.Visualizer)
@Controller('users')
export class UsersController {
  constructor(@Inject('USER_SERVICE') private readonly client: ClientProxy) {}

  @Get()
  findAll(@CurrentUser() _user: unknown) {
    return this.client.send('findAllUsers', {});
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.client.send('findUserById', id);
  }
  @Roles(Role.Superadmin)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: Record<string, unknown>,
  ) {
    return this.client.send('updateUser', { id, data: updateUserDto });
  }

  @Roles(Role.Superadmin)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.client.send('removeUser', id);
  }
}
