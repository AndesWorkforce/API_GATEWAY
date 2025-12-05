import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { envs, getLogModeMessage, resolveLogLevels } from 'config';

import { AppModule } from './app.module';
import { RpcExceptionsFilter } from './filters/rpc-exception.filter';

async function bootstrap() {
  const logLevels = resolveLogLevels();
  Logger.overrideLogger(logLevels);

  const app = await NestFactory.create(AppModule, { logger: logLevels });
  const logger = new Logger('Main-Gateway');
  const log = (message: string) =>
    envs.devLogsEnabled ? logger.log(message) : logger.warn(message);

  const modeMessage = getLogModeMessage();
  if (envs.devLogsEnabled) {
    logger.verbose(modeMessage);
  } else {
    logger.warn(modeMessage);
  }

  // Configurar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new RpcExceptionsFilter());

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.NATS,
      options: {
        servers: [`nats://${envs.natsHost}:${envs.natsPort}`],
        user: envs.natsUsername,
        pass: envs.natsPassword,
      },
    },
    { inheritAppConfig: true },
  );

  // CORS configuration
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'https://client.test.andes-workforce.com',
    'http://v8wcw0g80kg400ocg8804w0s.72.61.129.234.sslip.io',
    // Additional origins from environment variable
    ...(process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
      : []),
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      if (envs.environment === 'development') {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Authorization'],
  });

  await app.startAllMicroservices();
  log('✅ API Gateway microservicio NATS conectado');

  await app.listen(envs.port);
  log(`✅ API Gateway HTTP corriendo en puerto ${envs.port}`);
}
bootstrap();
