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

  @Get(':id/day-offs')
  findUserWithDayOffs(@Param('id') id: string) {
    return this.client.send('findUserWithDayOffs', id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: any) {
    return this.client.send('updateUser', { id, updateUserDto });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.client.send('removeUser', id);
  }

  // User Day Off endpoints
  @Post(':id/day-offs')
  createUserDayOff(@Param('id') id: string, @Body() createUserDayOffDto: any) {
    return this.client.send('createUserDayOff', {
      ...createUserDayOffDto,
      user_id: id,
    });
  }

  @Get(':id/day-offs')
  findUserDayOffs(@Param('id') id: string) {
    return this.client.send('findUserDayOffs', id);
  }

  @Get('day-offs/:dayOffId')
  findUserDayOffById(@Param('dayOffId') dayOffId: string) {
    return this.client.send('findUserDayOffById', dayOffId);
  }

  @Patch('day-offs/:dayOffId')
  updateUserDayOff(
    @Param('dayOffId') dayOffId: string,
    @Body() updateUserDayOffDto: any,
  ) {
    return this.client.send('updateUserDayOff', {
      id: dayOffId,
      updateUserDayOffDto,
    });
  }

  @Delete('day-offs/:dayOffId')
  removeUserDayOff(@Param('dayOffId') dayOffId: string) {
    return this.client.send('removeUserDayOff', dayOffId);
  }
}
