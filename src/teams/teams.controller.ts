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

@Controller('teams')
export class TeamsController {
  constructor(@Inject('USER_SERVICE') private readonly client: ClientProxy) {}

  // Team endpoints
  @Post()
  create(@Body() createTeamDto: any) {
    return this.client.send('createTeam', createTeamDto);
  }

  @Get()
  findAll() {
    return this.client.send('findAllTeams', {});
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.client.send('findTeamById', id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTeamDto: any) {
    return this.client.send('updateTeam', { id, updateTeamDto });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.client.send('removeTeam', id);
  }
}
