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
@Controller('apps')
export class ApplicationsController {
  constructor(@Inject('USER_SERVICE') private readonly client: ClientProxy) {}

  @Roles(Role.Superadmin, Role.TeamAdmin)
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
    return this.client.send('findAppById', { id });
  }
  @Roles(Role.Superadmin, Role.TeamAdmin)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAppDto: any) {
    return this.client.send('updateApp', { id, updateAppDto });
  }
  @Roles(Role.Superadmin, Role.TeamAdmin)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.client.send('removeApp', id);
  }
  @Roles(Role.Superadmin, Role.TeamAdmin)
  @Post('contractor/:contractorId/assign')
  assignAppsToContractor(
    @Param('contractorId') contractorId: string,
    @Body() body: { app_ids: string[] },
  ) {
    return this.client.send('assignAppsToContractor', {
      contractorId,
      assignApplicationsDto: body,
    });
  }

  @Get('contractor/:contractorId')
  getAppsByContractor(@Param('contractorId') contractorId: string) {
    return this.client.send('getAppsByContractor', contractorId);
  }
  @Roles(Role.Superadmin, Role.TeamAdmin)
  @Delete('contractor/:contractorId/remove')
  removeAppsFromContractor(
    @Param('contractorId') contractorId: string,
    @Body() body: { app_ids: string[] },
  ) {
    return this.client.send('removeAppsFromContractor', {
      contractorId,
      assignApplicationsDto: body,
    });
  }
}
