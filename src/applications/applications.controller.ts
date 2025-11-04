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

@Controller('apps')
export class ApplicationsController {
  constructor(@Inject('USER_SERVICE') private readonly client: ClientProxy) {}

  @Post()
  create(@Body() createAppDto: any) {
    return this.client.send('createApp', createAppDto);
  }

  @Get()
  findAll() {
    return this.client.send('findAllApps', {});
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.client.send('findAppById', id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAppDto: any) {
    return this.client.send('updateApp', { id, updateAppDto });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.client.send('removeApp', id);
  }

  @Post('contractor/:contractorId/assign')
  assignAppsToContractor(
    @Param('contractorId') contractorId: string,
    @Body() body: { app_ids: string[] },
  ) {
    return this.client.send('assignAppsToContractor', {
      contractorId,
      assignAppsDto: body,
    });
  }

  @Get('contractor/:contractorId')
  getAppsByContractor(@Param('contractorId') contractorId: string) {
    return this.client.send('getAppsByContractor', contractorId);
  }
}

