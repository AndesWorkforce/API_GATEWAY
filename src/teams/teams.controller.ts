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

import { getMessagePattern } from 'config';
import { Role } from 'src/common/enums/role.enum';
import { AllowClient, Roles } from 'src/decorators/roles.decorator';

@Roles(Role.Superadmin, Role.TeamAdmin, Role.Visualizer)
@AllowClient()
@Controller('teams')
export class TeamsController {
  constructor(@Inject('USER_SERVICE') private readonly client: ClientProxy) {}

  @Roles(Role.Superadmin, Role.TeamAdmin)
  @AllowClient()
  @Post()
  create(@Body() createTeamDto: any) {
    return this.client
      .send(getMessagePattern('createTeam'), createTeamDto)
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Get()
  findAll() {
    return this.client.send(getMessagePattern('findAllTeams'), {}).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.client.send(getMessagePattern('findTeamById'), id).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Roles(Role.Superadmin, Role.TeamAdmin)
  @AllowClient()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTeamDto: any) {
    return this.client
      .send(getMessagePattern('updateTeam'), { id, updateTeamDto })
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Roles(Role.Superadmin, Role.TeamAdmin)
  @AllowClient()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.client.send(getMessagePattern('removeTeam'), id).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Roles(Role.Superadmin, Role.TeamAdmin)
  @AllowClient()
  @Post(':id/assign-contractors')
  assignContractors(
    @Param('id') id: string,
    @Body() body: { contractorIds: string[] },
  ) {
    return this.client
      .send(getMessagePattern('assignContractorsToTeam'), {
        teamId: id,
        contractor_ids: body.contractorIds,
      })
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }
}
