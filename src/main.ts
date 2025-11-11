import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { envs } from 'config/envs';

import { AppModule } from './app.module';
import { AuthGuard } from './guards/auth.guard';

async function bootstrap() {
  const logger = new Logger('Main-Gateway');

  // Crear aplicación HTTP
  const app = await NestFactory.create(AppModule);

  // Configurar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const authGuard = app.get(AuthGuard);
  app.useGlobalGuards(authGuard);

  app.enableCors();

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: [`nats://${envs.natsHost}:${envs.natsPort}`],
      user: envs.natsUsername,
      pass: envs.natsPassword,
    },
  });

  await app.startAllMicroservices();
  logger.log('✅ API Gateway microservicio NATS conectado');

  await app.listen(envs.port);
  logger.log(`✅ API Gateway HTTP corriendo en puerto ${envs.port}`);

}
bootstrap();
