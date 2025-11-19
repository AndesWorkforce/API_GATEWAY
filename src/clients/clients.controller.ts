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

import { Role } from 'src/common/enums/role.enum';
import { AllowClient, Roles } from 'src/decorators/roles.decorator';

@Roles(Role.Superadmin, Role.TeamAdmin, Role.Visualizer)
@AllowClient()
@Controller('clients')
export class ClientsController {
  constructor(@Inject('USER_SERVICE') private readonly client: ClientProxy) {}

  @Get()
  findAll() {
    return this.client.send('findAllClients_', {});
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.client.send('findClientById', id);
  }

  @Roles(Role.Superadmin, Role.TeamAdmin)
  @AllowClient()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClientDto: any) {
    return this.client.send('updateClient', { id, updateClientDto });
  }

  @Roles(Role.Superadmin, Role.TeamAdmin)
  @AllowClient()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.client.send('removeClient', id);
  }

  @Roles(Role.Superadmin, Role.TeamAdmin)
  @AllowClient()
  @Post(':id/assign-contractors')
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
