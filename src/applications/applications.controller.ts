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

import { getMessagePattern } from 'config';
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
    return this.client.send(getMessagePattern('createApp'), createAppDto).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get()
  findAll() {
    return this.client.send(getMessagePattern('findAllApps'), {}).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.client.send(getMessagePattern('findAppById'), id).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }
  @Roles(Role.Superadmin, Role.TeamAdmin)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAppDto: any) {
    return this.client
      .send(getMessagePattern('updateApp'), { id, updateAppDto })
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }
  @Roles(Role.Superadmin, Role.TeamAdmin)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.client.send(getMessagePattern('removeApp'), id).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }
  @Roles(Role.Superadmin, Role.TeamAdmin)
  @Post('contractor/:contractorId/assign')
  assignAppsToContractor(
    @Param('contractorId') contractorId: string,
    @Body() body: { app_ids: string[] },
  ) {
    return this.client
      .send(getMessagePattern('assignAppsToContractor'), {
        contractorId,
        assignApplicationsDto: body,
      })
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Get('contractor/:contractorId')
  getAppsByContractor(@Param('contractorId') contractorId: string) {
    return this.client
      .send(getMessagePattern('getAppsByContractor'), contractorId)
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }
  @Roles(Role.Superadmin, Role.TeamAdmin)
  @Roles(Role.Superadmin, Role.TeamAdmin)
  @Delete('contractor/:contractorId/remove')
  removeAppsFromContractor(
    @Param('contractorId') contractorId: string,
    @Body() body: { app_ids: string[] },
  ) {
    return this.client
      .send(getMessagePattern('removeAppsFromContractor'), {
        contractorId,
        assignApplicationsDto: body,
      })
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }
}
