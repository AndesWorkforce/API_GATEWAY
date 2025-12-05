import { Controller, Get, Param, Query, Inject, Logger } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, timeout } from 'rxjs';

import { getMessagePattern } from 'config';
import { Role } from 'src/common/enums/role.enum';
import { AllowClient, Roles } from 'src/decorators/roles.decorator';

/**
 * Controller HTTP para consultar las tablas ADT (Analytical Data Tables).
 * Proporciona endpoints para obtener métricas de productividad y actividad.
 * Las peticiones se envían vía NATS al ADT_MS.
 */
@Roles(Role.Superadmin, Role.TeamAdmin, Role.Visualizer)
@AllowClient()
@Controller('adt')
export class AdtController {
  private readonly logger = new Logger(AdtController.name);

  constructor(@Inject('ADT_SERVICE') private readonly client: ClientProxy) {}

  /**
   * Helper function para validar y convertir fechas
   */
  private parseDate(dateStr?: string): string | undefined {
    if (!dateStr || dateStr.trim() === '') {
      return undefined;
    }
    const date = new Date(dateStr.trim());
    // Validar que la fecha sea válida
    if (isNaN(date.getTime())) {
      return undefined;
    }
    return date.toISOString();
  }

  /**
   * Obtiene métricas diarias de un contractor (desde tabla ADT).
   * GET /adt/daily-metrics/:contractorId?days=30
   */
  @Get('daily-metrics/:contractorId')
  getDailyMetrics(
    @Param('contractorId') contractorId: string,
    @Query('days') days: string = '30',
  ) {
    return this.client
      .send(getMessagePattern('adt.getDailyMetrics'), {
        contractorId,
        days: parseInt(days, 10) || 30,
      })
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  /**
   * Obtiene métricas de productividad en tiempo real de todos los contratistas que tienen métricas.
   * Solo devuelve contratistas que tienen datos (total_beats > 0).
   *
   * Puede recibir:
   * - workday: un día específico (YYYY-MM-DD)
   * - from y to: un rango de fechas (YYYY-MM-DD) - devuelve métricas agregadas
   * - Filtros opcionales: name, job_position, country, client_id, team_id
   *
   * GET /adt/realtime-metrics?workday=2025-01-15
   * GET /adt/realtime-metrics?from=2025-12-01&to=2025-12-05
   * GET /adt/realtime-metrics?from=2025-12-01&to=2025-12-05&client_id=xxx&team_id=yyy&job_position=Software Developer
   */
  @Get('realtime-metrics')
  getAllRealtimeMetrics(
    @Query('workday') workday?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('name') name?: string,
    @Query('job_position') jobPosition?: string,
    @Query('country') country?: string,
    @Query('client_id') clientId?: string,
    @Query('team_id') teamId?: string,
    @Query('useCache') useCache: string = 'true',
  ) {
    const pattern = getMessagePattern('adt.getAllRealtimeMetrics');
    const payload = {
      workday: this.parseDate(workday),
      from: this.parseDate(from),
      to: this.parseDate(to),
      name: name?.trim() || undefined,
      job_position: jobPosition?.trim() || undefined,
      country: country?.trim() || undefined,
      client_id: clientId?.trim() || undefined,
      team_id: teamId?.trim() || undefined,
      useCache: useCache !== 'false',
    };

    this.logger.log(`📤 Enviando petición a ADT_MS: ${pattern}`);
    this.logger.debug(`📦 Payload: ${JSON.stringify(payload)}`);

    return this.client.send(pattern, payload).pipe(
      timeout(30000), // 30 segundos de timeout
      catchError((error) => {
        this.logger.error('❌ Error en getAllRealtimeMetrics:', {
          pattern,
          payload,
          error: error?.message || error,
          errorName: error?.name,
          errorCode: error?.code,
          errorDetails: error,
        });

        // Si es un timeout
        if (error?.name === 'TimeoutError' || error?.code === 'TIMEOUT') {
          throw new RpcException({
            status: 504,
            message:
              'Timeout waiting for ADT service response. The service may be unavailable or taking too long.',
            details: { pattern, timeout: '30s' },
          });
        }

        // Si es un error de conexión
        if (
          error?.message?.includes('Empty response') ||
          error?.message?.includes('No response')
        ) {
          throw new RpcException({
            status: 503,
            message:
              'ADT service is not responding. Please check if the service is running and connected to NATS.',
            details: { pattern },
          });
        }

        throw new RpcException({
          status: 500,
          message: error?.message || 'Error communicating with ADT service',
          details: error?.details || error,
        });
      }),
    );
  }

  /**
   * Obtiene métricas de productividad en tiempo real para un contractor.
   * Calcula desde contractor_activity_15s con caché de 30 segundos.
   * Ideal para dashboards que necesitan actualización frecuente.
   *
   * Puede recibir:
   * - workday: un día específico (YYYY-MM-DD)
   * - from y to: un rango de fechas (YYYY-MM-DD) - devuelve métricas agregadas
   *
   * GET /adt/realtime-metrics/:contractorId?workday=2025-01-15
   * GET /adt/realtime-metrics/:contractorId?from=2025-12-01&to=2025-12-05
   */
  @Get('realtime-metrics/:contractorId')
  getRealtimeMetrics(
    @Param('contractorId') contractorId: string,
    @Query('workday') workday?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('useCache') useCache: string = 'true',
  ) {
    return this.client
      .send(getMessagePattern('adt.getRealtimeMetrics'), {
        contractorId,
        workday: this.parseDate(workday),
        from: this.parseDate(from),
        to: this.parseDate(to),
        useCache: useCache !== 'false',
      })
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  /**
   * Obtiene resúmenes de sesión de un contractor.
   * GET /adt/sessions/:contractorId?days=30
   */
  @Get('sessions/:contractorId')
  getSessionSummaries(
    @Param('contractorId') contractorId: string,
    @Query('days') days: string = '30',
  ) {
    return this.client
      .send(getMessagePattern('adt.getSessionSummaries'), {
        contractorId,
        days: parseInt(days, 10) || 30,
      })
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  /**
   * Obtiene actividad detallada (beats de 15s) de un contractor.
   * GET /adt/activity/:contractorId?from=2025-01-01&to=2025-01-31
   */
  @Get('activity/:contractorId')
  getActivity(
    @Param('contractorId') contractorId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit: string = '1000',
  ) {
    return this.client
      .send(getMessagePattern('adt.getActivity'), {
        contractorId,
        from: from ? new Date(from).toISOString() : undefined,
        to: to ? new Date(to).toISOString() : undefined,
        limit: parseInt(limit, 10) || 1000,
      })
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  /**
   * Obtiene uso de aplicaciones de un contractor.
   * GET /adt/app-usage/:contractorId?days=30
   */
  @Get('app-usage/:contractorId')
  getAppUsage(
    @Param('contractorId') contractorId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    // compatibilidad: permitir aún 'days' (opcional)
    @Query('days') days?: string,
  ) {
    return this.client
      .send(getMessagePattern('adt.getAppUsage'), {
        contractorId,
        from: from ? new Date(from).toISOString() : undefined,
        to: to ? new Date(to).toISOString() : undefined,
        days: !from && !to && days ? parseInt(days, 10) || 30 : undefined,
      })
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  /**
   * Obtiene ranking de productividad por día.
   * GET /adt/ranking?workday=2025-01-15&limit=10
   */
  @Get('ranking')
  getRanking(
    @Query('workday') workday?: string,
    @Query('limit') limit: string = '10',
  ) {
    return this.client
      .send(getMessagePattern('adt.getRanking'), {
        workday: workday ? new Date(workday).toISOString() : undefined,
        limit: parseInt(limit, 10) || 10,
      })
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  /**
   * Endpoint para ejecutar ETL manualmente (útil para testing/admin).
   * GET /adt/etl/process-events?from=2025-01-01&to=2025-01-31
   */
  @Roles(Role.Superadmin)
  @Get('etl/process-events')
  processEvents(@Query('from') from?: string, @Query('to') to?: string) {
    return this.client
      .send(getMessagePattern('adt.processEvents'), {
        from: from ? new Date(from).toISOString() : undefined,
        to: to ? new Date(to).toISOString() : undefined,
      })
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  /**
   * Endpoint para ejecutar ETL manual (FORCE): borra e inserta (útil para backfill duro).
   * GET /adt/etl/process-events-force?from=2025-01-01&to=2025-01-31
   */
  @Roles(Role.Superadmin)
  @Get('etl/process-events-force')
  processEventsForce(@Query('from') from?: string, @Query('to') to?: string) {
    return this.client
      .send(getMessagePattern('adt.processEventsForce'), {
        from: from ? new Date(from).toISOString() : undefined,
        to: to ? new Date(to).toISOString() : undefined,
      })
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  /**
   * Endpoint para ejecutar ETL de métricas diarias manualmente.
   * Puede procesar un día específico o un rango de fechas.
   *
   * Ejemplos:
   * - GET /adt/etl/process-daily-metrics?workday=2025-01-15 (un día)
   * - GET /adt/etl/process-daily-metrics?from=2025-01-01&to=2025-01-31 (rango)
   * - GET /adt/etl/process-daily-metrics (día actual por defecto)
   */
  @Roles(Role.Superadmin)
  @Get('etl/process-daily-metrics')
  processDailyMetrics(
    @Query('workday') workday?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.client
      .send(getMessagePattern('adt.processDailyMetrics'), {
        workday: workday ? new Date(workday).toISOString() : undefined,
        from: from ? new Date(from).toISOString() : undefined,
        to: to ? new Date(to).toISOString() : undefined,
      })
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  /**
   * Endpoint para ejecutar ETL de resúmenes de sesión manualmente.
   * GET /adt/etl/process-session-summaries?sessionId=xxx
   */
  @Roles(Role.Superadmin)
  @Get('etl/process-session-summaries')
  processSessionSummaries(@Query('sessionId') sessionId?: string) {
    return this.client
      .send(getMessagePattern('adt.processSessionSummaries'), {
        sessionId,
      })
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  /**
   * Endpoint para ejecutar ETL de uso de aplicaciones manualmente.
   * GET /adt/etl/process-app-usage?from=2025-01-01&to=2025-01-31
   */
  @Roles(Role.Superadmin)
  @Get('etl/process-app-usage')
  processAppUsage(@Query('from') from?: string, @Query('to') to?: string) {
    return this.client
      .send(getMessagePattern('adt.processAppUsage'), {
        from: from ? new Date(from).toISOString() : undefined,
        to: to ? new Date(to).toISOString() : undefined,
      })
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  /**
   * Endpoint FORCE para uso de aplicaciones (DELETE + INSERT).
   * GET /adt/etl/process-app-usage-force?from=YYYY-MM-DD&to=YYYY-MM-DD
   */
  @Roles(Role.Superadmin)
  @Get('etl/process-app-usage-force')
  processAppUsageForce(@Query('from') from?: string, @Query('to') to?: string) {
    return this.client
      .send(getMessagePattern('adt.processAppUsageForce'), {
        from: from ? new Date(from).toISOString() : undefined,
        to: to ? new Date(to).toISOString() : undefined,
      })
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }
}
