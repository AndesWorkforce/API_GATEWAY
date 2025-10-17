import { Module } from '@nestjs/common';
import {
  ClientsModule as NestClientsModule,
  Transport,
} from '@nestjs/microservices';

import { envs } from 'config';

import { ClientsController } from './clients.controller';

@Module({
  imports: [
    NestClientsModule.register([
      {
        name: 'USER_SERVICE',
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
  controllers: [ClientsController],
})
export class ClientsModule {}
