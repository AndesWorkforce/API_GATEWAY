import { Module } from '@nestjs/common';

import { SessionsController } from './sessions.controller';

@Module({
  imports: [],
  controllers: [SessionsController],
})
export class SessionsModule {}
