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

@Controller('clients')
export class ClientsController {
  constructor(@Inject('USER_SERVICE') private readonly client: ClientProxy) {}

  @Post()
  create(@Body() createClientDto: any) {
    return this.client.send('createClient', createClientDto);
  }

  @Get()
  findAll() {
    return this.client.send('findAllClients', {});
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.client.send('findClientById', id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClientDto: any) {
    return this.client.send('updateClient', { id, updateClientDto });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.client.send('removeClient', id);
  }

  @Post(':id/assign-contractors')
  assignContractors(@Param('id') id: string, @Body() body: { contractorIds: string[] }) {
    return this.client.send('assignContractorsToClient', { clientId: id, contractorIds: body.contractorIds });
  }
}
