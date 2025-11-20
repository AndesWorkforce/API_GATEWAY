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

import { Role } from 'src/common/enums/role.enum';
import { AllowClient, Roles } from 'src/decorators/roles.decorator';

import { Public } from '../decorators/public.decorator';

@Roles(Role.Superadmin, Role.TeamAdmin, Role.Visualizer)
@AllowClient()
@Controller('contractors')
export class ContractorsController {
  constructor(@Inject('USER_SERVICE') private readonly client: ClientProxy) {}
  @Roles(Role.Superadmin, Role.TeamAdmin)
  @AllowClient()
  @Post()
  create(@Body() createContractorDto: any) {
    return this.client.send('createContractor', createContractorDto).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get()
  findAll() {
    return this.client.send('findAllContractors', {}).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.client.send('findContractorById', id).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get(':id/with-day-offs')
  findOneWithDayOffs(@Param('id') id: string) {
    return this.client.send('findContractorWithDayOffs', id).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get('client/:clientId')
  findByClientId(@Param('clientId') clientId: string) {
    return this.client.send('findContractorsByClientId', clientId).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get('team/:teamId')
  findByTeamId(@Param('teamId') teamId: string) {
    return this.client.send('findContractorsByTeamId', teamId).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Public()
  @Get('by-activation-key/:activationKey')
  findByActivationKey(@Param('activationKey') activationKey: string) {
    return this.client
      .send('findContractorByActivationKey', activationKey)
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Roles(Role.Superadmin, Role.TeamAdmin)
  @AllowClient()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContractorDto: any) {
    return this.client
      .send('updateContractor', { id, updateContractorDto })
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
    return this.client.send('removeContractor', id).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  // Contractor Day Off endpoints
  @Roles(Role.Superadmin, Role.TeamAdmin)
  @AllowClient()
  @Post(':id/day-offs')
  createContractorDayOff(
    @Param('id') id: string,
    @Body() createContractorDayOffDto: any,
  ) {
    return this.client
      .send('createContractorDayOff', {
        ...createContractorDayOffDto,
        contractor_id: id,
      })
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Get(':id/day-offs')
  findContractorDayOffs(@Param('id') id: string) {
    return this.client.send('findContractorDayOffs', id).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get('day-offs/:dayOffId')
  findContractorDayOffById(@Param('dayOffId') dayOffId: string) {
    return this.client.send('findContractorDayOffById', dayOffId).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Roles(Role.Superadmin, Role.TeamAdmin)
  @AllowClient()
  @Patch('day-offs/:dayOffId')
  updateContractorDayOff(
    @Param('dayOffId') dayOffId: string,
    @Body() updateContractorDayOffDto: any,
  ) {
    return this.client
      .send('updateContractorDayOff', {
        id: dayOffId,
        updateContractorDayOffDto,
      })
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Roles(Role.Superadmin, Role.TeamAdmin)
  @AllowClient()
  @Delete('day-offs/:dayOffId')
  removeContractorDayOff(@Param('dayOffId') dayOffId: string) {
    return this.client.send('removeContractorDayOff', dayOffId).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }
}
