import { Controller, Get, Param, Query, Inject } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';

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
    return this.client
      .send(getMessagePattern('adt.getAllRealtimeMetrics'), {
        workday: this.parseDate(workday),
        from: this.parseDate(from),
        to: this.parseDate(to),
        name: name?.trim() || undefined,
        job_position: jobPosition?.trim() || undefined,
        country: country?.trim() || undefined,
        client_id: clientId?.trim() || undefined,
        team_id: teamId?.trim() || undefined,
        useCache: useCache !== 'false',
      })
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
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
   * Puede filtrar por rango de fechas (from/to) o por días hacia atrás (days).
   *
   * GET /adt/sessions/:contractorId?days=30
   * GET /adt/sessions/:contractorId?from=2025-12-24&to=2025-12-28
   */
  @Get('sessions/:contractorId')
  getSessionSummaries(
    @Param('contractorId') contractorId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('days') days: string = '30',
  ) {
    return this.client
      .send(getMessagePattern('adt.getSessionSummaries'), {
        contractorId,
        from: from?.trim() || undefined,
        to: to?.trim() || undefined,
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
   * Obtiene top 5 mejores rankings de productividad.
   * @param period 'day' (día actual), 'week' (última semana), 'month' (mes actual)
   * GET /adt/ranking/top5-best?period=day
   * GET /adt/ranking/top5-best?period=week
   * GET /adt/ranking/top5-best?period=month
   */
  @Get('ranking/top5-best')
  getTop5BestRanking(
    @Query('period') period: string = 'day',
    @Query('useCache') useCache: string = 'true',
  ) {
    // Validar que period sea uno de los valores permitidos
    const validPeriod = ['day', 'week', 'month'].includes(period)
      ? (period as 'day' | 'week' | 'month')
      : 'day';

    return this.client
      .send(getMessagePattern('adt.getTop5BestRanking'), {
        period: validPeriod,
        useCache: useCache !== 'false',
      })
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  /**
   * Obtiene top 5 peores rankings de productividad.
   * @param period 'day' (día actual), 'week' (última semana), 'month' (mes actual)
   * GET /adt/ranking/top5-worst?period=day
   * GET /adt/ranking/top5-worst?period=week
   * GET /adt/ranking/top5-worst?period=month
   */
  @Get('ranking/top5-worst')
  getTop5WorstRanking(
    @Query('period') period: string = 'day',
    @Query('useCache') useCache: string = 'true',
  ) {
    // Validar que period sea uno de los valores permitidos
    const validPeriod = ['day', 'week', 'month'].includes(period)
      ? (period as 'day' | 'week' | 'month')
      : 'day';

    return this.client
      .send(getMessagePattern('adt.getTop5WorstRanking'), {
        period: validPeriod,
        useCache: useCache !== 'false',
      })
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  /**
   * Obtiene el porcentaje de talento activo vs inactivo en un período.
   * Un contractor se considera "activo" si tiene métricas (beats) en el período.
   * @param period 'day' (día actual), 'week' (última semana), 'month' (mes actual)
   * GET /adt/active-talent?period=day
   * GET /adt/active-talent?period=week
   * GET /adt/active-talent?period=month
   */
  @Get('active-talent')
  getActiveTalentPercentage(
    @Query('period') period: string = 'day',
    @Query('useCache') useCache: string = 'true',
  ) {
    // Validar que period sea uno de los valores permitidos
    const validPeriod = ['day', 'week', 'month'].includes(period)
      ? (period as 'day' | 'week' | 'month')
      : 'day';

    return this.client
      .send(getMessagePattern('adt.getActiveTalentPercentage'), {
        period: validPeriod,
        useCache: useCache !== 'false',
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
