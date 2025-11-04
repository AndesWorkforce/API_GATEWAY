import { Module } from '@nestjs/common';
import { WorkingHoursInterceptor } from './interceptors/working-hours.interceptor';

import { EventsController } from './events.controller';

@Module({
  imports: [],
  controllers: [EventsController],
  providers: [WorkingHoursInterceptor],
})
export class EventsModule {}
