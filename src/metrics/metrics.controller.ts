import { Controller, Get, Param, Inject } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';

@Controller('metrics')
export class MetricsController {
  constructor(@Inject('USER_SERVICE') private readonly client: ClientProxy) {}

  @Get('contractor/:contractorId')
  getContractorMetrics(@Param('contractorId') contractorId: string) {
    return this.client.send('getContractorMetrics', { contractorId }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }
}
