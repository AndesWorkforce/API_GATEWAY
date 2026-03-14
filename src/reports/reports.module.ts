import { Module } from '@nestjs/common';

import { NatsModule } from 'src/nats/nats.module';

import { ReportsController } from './reports.controller';

/**
 * Módulo de reportes
 * Maneja la generación de reportes PDF a través del UPLOAD_MS
 */
@Module({
  imports: [NatsModule],
  controllers: [ReportsController],
})
export class ReportsModule {}
