import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { envs } from 'config';

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
  logger.log('✅ Microservicio NATS conectado y escuchando mensajes');

  await app.listen(envs.port);
  logger.log(`✅ API Gateway HTTP corriendo en puerto ${envs.port}`);
  logger.log(`🚀 API Gateway híbrido (HTTP + NATS) listo para recibir y enviar mensajes`);

  process.on('SIGTERM', async () => {
    logger.log('🛑 SIGTERM recibido, cerrando aplicación...');
    await app.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.log('🛑 SIGINT recibido, cerrando aplicación...');
    await app.close();
    process.exit(0);
  });
}
bootstrap();
