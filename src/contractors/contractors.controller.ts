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

import { Public } from '../decorators/public.decorator';

@Controller('contractors')
export class ContractorsController {
  constructor(@Inject('USER_SERVICE') private readonly client: ClientProxy) {}

  // Contractor endpoints
  @Post()
  create(@Body() createContractorDto: any) {
    return this.client.send('createContractor', createContractorDto);
  }

  @Get()
  findAll() {
    return this.client.send('findAllContractorsList', {});
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.client.send('findContractorById', id);
  }

  @Get(':id/with-day-offs')
  findOneWithDayOffs(@Param('id') id: string) {
    return this.client.send('findContractorWithDayOffs', id);
  }

  @Get('client/:clientId')
  findByClientId(@Param('clientId') clientId: string) {
    return this.client.send('findContractorsByClientId', clientId);
  }

  @Get('team/:teamId')
  findByTeamId(@Param('teamId') teamId: string) {
    return this.client.send('findContractorsByTeamId', teamId);
  }

  @Public()
  @Get('by-activation-key/:activationKey')
  findByActivationKey(@Param('activationKey') activationKey: string) {
    return this.client.send('findContractorByActivationKey', activationKey);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContractorDto: any) {
    return this.client.send('updateContractor', { id, updateContractorDto });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.client.send('removeContractor', id);
  }

  // Contractor Day Off endpoints
  @Post(':id/day-offs')
  createContractorDayOff(
    @Param('id') id: string,
    @Body() createContractorDayOffDto: any,
  ) {
    return this.client.send('createContractorDayOff', {
      ...createContractorDayOffDto,
      contractor_id: id,
    });
  }

  @Get(':id/day-offs')
  findContractorDayOffs(@Param('id') id: string) {
    return this.client.send('findContractorDayOffs', id);
  }

  @Get('day-offs/:dayOffId')
  findContractorDayOffById(@Param('dayOffId') dayOffId: string) {
    return this.client.send('findContractorDayOffById', dayOffId);
  }

  @Patch('day-offs/:dayOffId')
  updateContractorDayOff(
    @Param('dayOffId') dayOffId: string,
    @Body() updateContractorDayOffDto: any,
  ) {
    return this.client.send('updateContractorDayOff', {
      id: dayOffId,
      updateContractorDayOffDto,
    });
  }

  @Delete('day-offs/:dayOffId')
  removeContractorDayOff(@Param('dayOffId') dayOffId: string) {
    return this.client.send('removeContractorDayOff', dayOffId);
  }
}
