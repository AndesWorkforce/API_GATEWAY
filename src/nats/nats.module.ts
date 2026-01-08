import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { envs } from 'config';

@Global()
@Module({
  imports: [
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
      {
        name: 'ADT_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: [`nats://${envs.natsHost}:${envs.natsPort}`],
          user: envs.natsUsername,
          pass: envs.natsPassword,
        },
      },
      {
        name: 'UPLOAD_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: [`nats://${envs.natsHost}:${envs.natsPort}`],
          user: envs.natsUsername,
          pass: envs.natsPassword,
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class NatsModule {}
