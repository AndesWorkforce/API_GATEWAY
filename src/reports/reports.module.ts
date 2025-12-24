import { Module } from '@nestjs/common';

import { ReportsController } from './reports.controller';
import { NatsModule } from '../nats/nats.module';

@Module({
  imports: [NatsModule],
  controllers: [ReportsController],
})
export class ReportsModule {}
