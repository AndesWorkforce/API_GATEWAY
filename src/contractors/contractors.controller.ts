import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Inject,
  Logger,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';

import { getMessagePattern } from 'config';
import { Role } from 'src/common/enums/role.enum';
import { AllowClient, Roles } from 'src/decorators/roles.decorator';

import { Public } from '../decorators/public.decorator';

@Roles(Role.Superadmin, Role.TeamAdmin, Role.Visualizer)
@AllowClient()
@Controller('contractors')
export class ContractorsController {
  private readonly logger = new Logger(ContractorsController.name);

  constructor(@Inject('USER_SERVICE') private readonly client: ClientProxy) {}
  @Roles(Role.Superadmin, Role.TeamAdmin)
  @AllowClient()
  @Post()
  create(@Body() createContractorDto: any) {
    return this.client
      .send(getMessagePattern('createContractor'), createContractorDto)
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Get()
  findAll(
    @Query('name') name?: string,
    @Query('country') country?: string,
    @Query('client_id') clientId?: string,
    @Query('team_id') teamId?: string,
    @Query('job_position') jobPosition?: string,
  ) {
    const filters: {
      name?: string;
      country?: string;
      client_id?: string;
      team_id?: string;
      job_position?: string;
    } = {};

    if (name?.trim()) {
      filters.name = name.trim();
    }
    if (country?.trim()) {
      filters.country = country.trim();
    }
    if (clientId?.trim()) {
      filters.client_id = clientId.trim();
    }
    if (teamId?.trim()) {
      filters.team_id = teamId.trim();
    }
    if (jobPosition?.trim()) {
      filters.job_position = jobPosition.trim();
    }

    // NATS no acepta undefined/null, siempre enviar un objeto (vacío si no hay filtros)
    // El microservicio manejará el objeto vacío como "sin filtros"
    const payload = Object.keys(filters).length > 0 ? filters : {};

    return this.client
      .send(getMessagePattern('findAllContractors'), payload)
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.client.send(getMessagePattern('findContractorById'), id).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get(':id/with-day-offs')
  findOneWithDayOffs(@Param('id') id: string) {
    return this.client
      .send(getMessagePattern('findContractorWithDayOffs'), id)
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Get('client/:clientId')
  findByClientId(@Param('clientId') clientId: string) {
    return this.client
      .send(getMessagePattern('findContractorsByClientId'), clientId)
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Get('team/:teamId')
  findByTeamId(@Param('teamId') teamId: string) {
    return this.client
      .send(getMessagePattern('findContractorsByTeamId'), teamId)
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Public()
  @Get('by-activation-key/:activationKey')
  findByActivationKey(@Param('activationKey') activationKey: string) {
    return this.client
      .send(getMessagePattern('findContractorByActivationKey'), activationKey)
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
      .send(getMessagePattern('updateContractor'), { id, updateContractorDto })
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
    return this.client.send(getMessagePattern('removeContractor'), id).pipe(
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
      .send(getMessagePattern('createContractorDayOff'), {
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
    return this.client
      .send(getMessagePattern('findContractorDayOffs'), id)
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Get('day-offs/:dayOffId')
  findContractorDayOffById(@Param('dayOffId') dayOffId: string) {
    return this.client
      .send(getMessagePattern('findContractorDayOffById'), dayOffId)
      .pipe(
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
      .send(getMessagePattern('updateContractorDayOff'), {
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
    return this.client
      .send(getMessagePattern('removeContractorDayOff'), dayOffId)
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }
}
