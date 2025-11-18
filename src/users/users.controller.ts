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

import { Role } from '../common/roles.enum';
import { Roles } from '../decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(@Inject('USER_SERVICE') private readonly client: ClientProxy) {}

  @Get()
  @Roles(Role.Superadmin, Role.Teamadmin)
  findAll() {
    return this.client.send('findAllUsers', {});
  }

  @Get(':id')
  @Roles(Role.Superadmin, Role.Teamadmin, Role.Client)
  findOne(@Param('id') id: string) {
    return this.client.send('findUserById', id);
  }

  @Patch(':id')
  @Roles(Role.Superadmin, Role.Teamadmin, Role.Client)
  update(@Param('id') id: string, @Body() updateUserDto: unknown) {
    return this.client.send('updateUser', { id, updateUserDto });
  }

  @Delete(':id')
  @Roles(Role.Superadmin)
  remove(@Param('id') id: string) {
    return this.client.send('removeUser', id);
  }
}
