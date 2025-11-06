/* eslint-disable sonarjs/no-duplicate-string */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AgentsModule } from './agents/agents.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApplicationsModule } from './applications/applications.module';
import { AuthModule } from './auth/auth.module';
import { ClientsModule as ClientsMsModule } from './clients/clients.module';
import { ContractorsModule } from './contractors/contractors.module';
import { EventsModule } from './events/events.module';
import { MetricsModule } from './metrics/metrics.module';
import { NatsModule } from './nats/nats.module';
import { SessionsModule } from './sessions/sessions.module';
import { TeamsModule } from './teams/teams.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    NatsModule,
    AuthModule,
    EventsModule,
    UsersModule,
    ClientsMsModule,
    TeamsModule,
    SessionsModule,
    ContractorsModule,
    AgentsModule,
    ApplicationsModule,
    MetricsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
