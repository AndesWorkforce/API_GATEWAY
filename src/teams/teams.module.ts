import { Module } from '@nestjs/common';

import { TeamsController } from './teams.controller';

@Module({
  imports: [],
  controllers: [TeamsController],
})
export class TeamsModule {}
