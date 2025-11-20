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

@Controller('apps')
export class ApplicationsController {
  constructor(@Inject('USER_SERVICE') private readonly client: ClientProxy) {}

  @Post()
  create(@Body() createAppDto: any) {
    return this.client.send('createApp', createAppDto).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get()
  findAll() {
    return this.client.send('findAllApps', {}).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.client.send('findAppById', { id }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAppDto: any) {
    return this.client.send('updateApp', { id, updateAppDto }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.client.send('removeApp', id).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Post('contractor/:contractorId/assign')
  assignAppsToContractor(
    @Param('contractorId') contractorId: string,
    @Body() body: { app_ids: string[] },
  ) {
    return this.client
      .send('assignAppsToContractor', {
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
    return this.client.send('getAppsByContractor', contractorId).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Delete('contractor/:contractorId/remove')
  removeAppsFromContractor(
    @Param('contractorId') contractorId: string,
    @Body() body: { app_ids: string[] },
  ) {
    return this.client
      .send('removeAppsFromContractor', {
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
