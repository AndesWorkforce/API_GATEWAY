import {
  Controller,
  Post,
  Body,
  Inject,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError } from 'rxjs';

import { getMessagePattern } from 'config';
import { Role } from 'src/common/enums/role.enum';
import { Roles } from 'src/decorators/roles.decorator';

import { GenerateReportDto } from './dto/generate-report.dto';

/**
 * Controller HTTP para generación de reportes PDF
 * Proporciona endpoints para solicitar reportes de productividad
 * Las peticiones se envían vía NATS al UPLOAD_MS
 */
@Roles(Role.Superadmin, Role.TeamAdmin, Role.Visualizer)
@Controller('reports')
export class ReportsController {
  constructor(@Inject('UPLOAD_SERVICE') private readonly client: ClientProxy) {}

  /**
   * Genera un reporte de productividad en PDF
   * POST /reports/generate
   *
   * @param dto - Parámetros del reporte (fechas, filtros, campos)
   * @returns URL del PDF generado en S3
   *
   * @example
   * {
   *   "from": "2025-01-01",
   *   "to": "2025-01-31",
   *   "team_id": "team-123",
   *   "selectedFields": ["contractorName", "timeWorked", "activityPercentage"]
   * }
   */
  @Post('generate')
  @HttpCode(HttpStatus.OK)
  generateReport(@Body() dto: GenerateReportDto) {
    return this.client
      .send(getMessagePattern('upload.reports.generate'), dto)
      .pipe(
        catchError((error) => {
          throw error;
        }),
      );
  }
}
