/* eslint-disable sonarjs/no-duplicate-string */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';

import { envs } from 'config';

import { AdtModule } from './adt/adt.module';
import { AgentsModule } from './agents/agents.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApplicationsModule } from './applications/applications.module';
import { AuthModule } from './auth/auth.module';
import { ClientsModule as ClientsMsModule } from './clients/clients.module';
import { ContractorsModule } from './contractors/contractors.module';
import { EventsModule } from './events/events.module';
import { AuthGuard } from './guards/auth.guard';
import { CustomThrottlerGuard } from './guards/custom-throttler.guard';
import { RolesGuard } from './guards/roles.guard';
import { NatsModule } from './nats/nats.module';
import { ReportsModule } from './reports/reports.module';
import { SessionsModule } from './sessions/sessions.module';
import { TeamsModule } from './teams/teams.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: envs.throttle.ttl,
        limit: envs.throttle.limit,
      },
    ]),
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
    AdtModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
