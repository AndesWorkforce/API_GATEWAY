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

@Controller('teams')
export class TeamsController {
  constructor(@Inject('USER_SERVICE') private readonly client: ClientProxy) {}

  @Post()
  create(@Body() createTeamDto: any) {
    return this.client.send('createTeam', createTeamDto).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get()
  findAll() {
    return this.client.send('findAllTeams', {}).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.client.send('findTeamById', id).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTeamDto: any) {
    return this.client.send('updateTeam', { id, updateTeamDto }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.client.send('removeTeam', id).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Post(':id/assign-contractors')
  assignContractors(
    @Param('id') id: string,
    @Body() body: { contractorIds: string[] },
  ) {
    return this.client
      .send('assignContractorsToTeam', {
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
