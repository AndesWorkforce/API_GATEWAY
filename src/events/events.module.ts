import { Module } from '@nestjs/common';
import {
  ClientsModule as NestClientsModule,
  Transport,
} from '@nestjs/microservices';

import { envs } from 'config';

import { EventsController } from './events.controller';

@Module({
  imports: [
    NestClientsModule.register([
      {
        name: 'AGENT_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: [
            `nats://${envs.natsHost}:${envs.natsPort}` ||
              'nats://localhost:4222',
          ],
          user: envs.natsUsername,
          pass: envs.natsPassword,
        },
      },
    ]),
  ],
  controllers: [EventsController],
})
export class EventsModule {}
