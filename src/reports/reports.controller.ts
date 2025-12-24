import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  Post,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';

import { getMessagePattern } from 'config';
import { Role } from 'src/common/enums/role.enum';
import { AllowClient, Roles } from 'src/decorators/roles.decorator';

import { ReportDataDto } from './dto/report-data.dto';

@Roles(Role.Superadmin, Role.TeamAdmin, Role.Visualizer)
@AllowClient()
@Controller('reports')
export class ReportsController {
  constructor(
    @Inject('ADT_SERVICE') private readonly adtClient: ClientProxy,
    @Inject('UPLOAD_SERVICE') private readonly uploadClient: ClientProxy,
  ) {}

  @Post('data')
  async getReportData(@Body() dto: ReportDataDto) {
    const { contractor_id: contractorId, useCache = true, ...filters } = dto;

    const fromDate = new Date(filters.from);
    const toDate = new Date(filters.to);

    if (Number.isNaN(fromDate.valueOf()) || Number.isNaN(toDate.valueOf())) {
      throw new BadRequestException('Invalid date format');
    }

    if (fromDate > toDate) {
      throw new BadRequestException('from must be before or equal to to');
    }

    const diffMs = toDate.getTime() - fromDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    if (diffDays > 90) {
      throw new BadRequestException('Date range cannot exceed 90 days');
    }

    const now = new Date();
    if (fromDate > now || toDate > now) {
      throw new BadRequestException('Dates cannot be in the future');
    }

    const from = fromDate.toISOString();
    const to = toDate.toISOString();

    // Si se pide un contractor específico, usar el endpoint puntual; de lo contrario, el agregado.
    if (contractorId) {
      return this.adtClient
        .send(getMessagePattern('adt.getRealtimeMetrics'), {
          contractorId,
          from,
          to,
          useCache,
        })
        .pipe(
          catchError((error) => {
            throw new RpcException(error);
          }),
        );
    }

    return this.adtClient
      .send(getMessagePattern('adt.getAllRealtimeMetrics'), {
        from,
        to,
        name: filters.name,
        job_position: filters.job_position,
        country: filters.country,
        client_id: filters.client_id,
        team_id: filters.team_id,
        useCache,
      })
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Post('generate-pdf')
  async generatePdfReport(@Body() dto: ReportDataDto) {
    const { contractor_id: contractorId, useCache = true, ...filters } = dto;

    const fromDate = new Date(filters.from);
    const toDate = new Date(filters.to);

    if (Number.isNaN(fromDate.valueOf()) || Number.isNaN(toDate.valueOf())) {
      throw new BadRequestException('Invalid date format');
    }

    if (fromDate > toDate) {
      throw new BadRequestException('from must be before or equal to to');
    }

    const diffMs = toDate.getTime() - fromDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    if (diffDays > 90) {
      throw new BadRequestException('Date range cannot exceed 90 days');
    }

    const now = new Date();
    if (fromDate > now || toDate > now) {
      throw new BadRequestException('Dates cannot be in the future');
    }

    const from = fromDate.toISOString();
    const to = toDate.toISOString();

    return this.uploadClient
      .send(getMessagePattern('upload.reports.generate'), {
        from,
        to,
        contractor_id: contractorId,
        name: filters.name,
        job_position: filters.job_position,
        country: filters.country,
        client_id: filters.client_id,
        team_id: filters.team_id,
        useCache,
      })
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }
}
