/* eslint-disable sonarjs/no-duplicate-string */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { envs } from 'config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ClientsModule as ClientsMsModule } from './clients/clients.module';
import { EventsModule } from './events/events.module';
import { AuthGuard } from './guards/auth.guard';
import { SessionsModule } from './sessions/sessions.module';
import { TeamsModule } from './teams/teams.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: [`nats://${envs.natsHost}:${envs.natsPort}`],
          user: envs.natsUsername,
          pass: envs.natsPassword,
        },
      },
      {
        name: 'USER_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: [`nats://${envs.natsHost}:${envs.natsPort}`],
          user: envs.natsUsername,
          pass: envs.natsPassword,
        },
      },
      {
        name: 'EVENTS_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: [`nats://${envs.natsHost}:${envs.natsPort}`],
          user: envs.natsUsername,
          pass: envs.natsPassword,
        },
      },
    ]),
    AuthModule,
    EventsModule,
    UsersModule,
    ClientsMsModule,
    TeamsModule,
    SessionsModule,
  ],
  controllers: [AppController],
  providers: [AppService, AuthGuard],
})
export class AppModule {}
