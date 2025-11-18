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

import { Role } from '../common/roles.enum';
import { Roles } from '../decorators/roles.decorator';

@Controller('teams')
export class TeamsController {
  constructor(@Inject('USER_SERVICE') private readonly client: ClientProxy) {}

  @Post()
  @Roles(Role.Superadmin, Role.Teamadmin)
  create(@Body() createTeamDto: unknown) {
    return this.client.send('createTeam', createTeamDto);
  }

  @Get()
  @Roles(Role.Superadmin, Role.Teamadmin)
  findAll() {
    return this.client.send('findAllTeams', {});
  }

  @Get(':id')
  @Roles(Role.Superadmin, Role.Teamadmin)
  findOne(@Param('id') id: string) {
    return this.client.send('findTeamById', id);
  }

  @Patch(':id')
  @Roles(Role.Superadmin, Role.Teamadmin)
  update(@Param('id') id: string, @Body() updateTeamDto: unknown) {
    return this.client.send('updateTeam', { id, updateTeamDto });
  }

  @Delete(':id')
  @Roles(Role.Superadmin)
  remove(@Param('id') id: string) {
    return this.client.send('removeTeam', id);
  }

  @Post(':id/assign-contractors')
  @Roles(Role.Superadmin, Role.Teamadmin)
  assignContractors(
    @Param('id') id: string,
    @Body() body: { contractorIds: string[] },
  ) {
    return this.client.send('assignContractorsToTeam', {
      teamId: id,
      contractorIds: body.contractorIds,
    });
  }
}
