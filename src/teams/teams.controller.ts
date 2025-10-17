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

  @Get(':id/subteams')
  findTeamWithSubteams(@Param('id') id: string) {
    return this.client.send('findTeamWithSubteams', id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTeamDto: any) {
    return this.client.send('updateTeam', { id, updateTeamDto });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.client.send('removeTeam', id);
  }

  // Subteam endpoints
  @Post(':teamId/subteams')
  createSubteam(
    @Param('teamId') teamId: string,
    @Body() createSubteamDto: any,
  ) {
    return this.client.send('createSubteam', {
      ...createSubteamDto,
      team_id: teamId,
    });
  }

  @Get(':teamId/subteams')
  findSubteamsByTeam(@Param('teamId') teamId: string) {
    return this.client.send('findSubteamsByTeam', teamId);
  }

  @Get('subteams/:subteamId')
  findSubteamById(@Param('subteamId') subteamId: string) {
    return this.client.send('findSubteamById', subteamId);
  }

  @Patch('subteams/:subteamId')
  updateSubteam(
    @Param('subteamId') subteamId: string,
    @Body() updateSubteamDto: any,
  ) {
    return this.client.send('updateSubteam', {
      id: subteamId,
      updateSubteamDto,
    });
  }

  @Delete('subteams/:subteamId')
  removeSubteam(@Param('subteamId') subteamId: string) {
    return this.client.send('removeSubteam', subteamId);
  }
}
