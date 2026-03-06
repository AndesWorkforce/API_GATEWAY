import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';

import { getMessagePattern } from 'config';
import { Role } from 'src/common/enums/role.enum';
import { AllowClient, AgentOnly, Roles } from 'src/decorators/roles.decorator';

import type { AssignDomainsToContractorDto } from './dto/assign-domains-to-contractor.dto';
import type { CreateDomainDto } from './dto/create-domain.dto';
import type { UpdateDomainDto } from './dto/update-domain.dto';

@Roles(Role.Superadmin, Role.TeamAdmin, Role.Visualizer)
@AllowClient()
@Controller('domains')
export class DomainsController {
  constructor(@Inject('USER_SERVICE') private readonly client: ClientProxy) {}

  @Roles(Role.Superadmin, Role.TeamAdmin)
  @Post()
  create(@Body() createDomainDto: CreateDomainDto) {
    return this.client
      .send(getMessagePattern('createDomain'), createDomainDto)
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Get()
  findAll() {
    return this.client.send(getMessagePattern('findAllDomains'), {}).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.client.send(getMessagePattern('findDomainById'), id).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Roles(Role.Superadmin, Role.TeamAdmin)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDomainDto: UpdateDomainDto) {
    return this.client
      .send(getMessagePattern('updateDomain'), { id, updateDomainDto })
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Roles(Role.Superadmin, Role.TeamAdmin)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.client.send(getMessagePattern('removeDomain'), id).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Roles(Role.Superadmin, Role.TeamAdmin)
  @AgentOnly()
  @Post('contractor/:contractorId/assign')
  assignDomainsToContractor(
    @Param('contractorId') contractorId: string,
    @Body() body: AssignDomainsToContractorDto,
  ) {
    return this.client
      .send(getMessagePattern('assignDomainsToContractor'), {
        contractorId,
        assignDomainsDto: body,
      })
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Get('contractor/:contractorId')
  getDomainsByContractor(@Param('contractorId') contractorId: string) {
    return this.client
      .send(getMessagePattern('getDomainsByContractor'), contractorId)
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Roles(Role.Superadmin, Role.TeamAdmin)
  @AgentOnly()
  @Delete('contractor/:contractorId/remove')
  removeDomainsFromContractor(
    @Param('contractorId') contractorId: string,
    @Body() body: AssignDomainsToContractorDto,
  ) {
    return this.client
      .send(getMessagePattern('removeDomainsFromContractor'), {
        contractorId,
        assignDomainsDto: body,
      })
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }
}
