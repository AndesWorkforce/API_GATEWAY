import { Module } from '@nestjs/common';

import { SessionsController } from './sessions.controller';
import { AgentSessionsController } from './agent-sessions.controller';

@Module({
  imports: [],
  controllers: [SessionsController, AgentSessionsController],
})
export class SessionsModule {}
