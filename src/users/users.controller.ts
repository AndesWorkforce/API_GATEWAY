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

import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(@Inject('USER_SERVICE') private readonly client: ClientProxy) {}

  @Post()
  create(@Body() createUserDto: any) {
    return this.client.send('createUser', createUserDto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    console.log('Usuario autenticado:', user);
    return this.client.send('findAllUsers', {});
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.client.send('findUserById', id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: any) {
    return this.client.send('updateUser', { id, updateUserDto });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.client.send('removeUser', id);
  }
}
