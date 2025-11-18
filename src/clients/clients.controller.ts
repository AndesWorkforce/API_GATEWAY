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

@Controller('clients')
export class ClientsController {
  constructor(@Inject('USER_SERVICE') private readonly client: ClientProxy) {}

  @Get()
  @Roles(Role.Superadmin, Role.Teamadmin)
  findAll() {
    return this.client.send('findAllClients', {});
  }

  @Get(':id')
  @Roles(Role.Superadmin, Role.Teamadmin, Role.Client)
  findOne(@Param('id') id: string) {
    return this.client.send('findClientById', id);
  }

  @Patch(':id')
  @Roles(Role.Superadmin, Role.Teamadmin)
  update(@Param('id') id: string, @Body() updateClientDto: unknown) {
    return this.client.send('updateClient', { id, updateClientDto });
  }

  @Delete(':id')
  @Roles(Role.Superadmin)
  remove(@Param('id') id: string) {
    return this.client.send('removeClient', id);
  }

  @Post(':id/assign-contractors')
  @Roles(Role.Superadmin, Role.Teamadmin)
  assignContractors(
    @Param('id') id: string,
    @Body() body: { contractorIds: string[] },
  ) {
    return this.client.send('assignContractorsToClient', {
      clientId: id,
      contractorIds: body.contractorIds,
    });
  }
}
