import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';

function parseTimeToMinutes(time: string): number | null {
  if (!time) return null;
  const match = /^([0-1]\d|2[0-3]):([0-5]\d)$/.exec(time);
  if (!match) return null;
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  return hours * 60 + minutes;
}

function isTimeInInterval(minutes: number, start: number, end: number): boolean {
  if (start <= end) {
    return minutes >= start && minutes < end;
  }
  return minutes >= start || minutes < end;
}

@Injectable()
export class WorkingHoursInterceptor implements NestInterceptor {
  constructor(@Inject('USER_SERVICE') private readonly userClient: ClientProxy) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const body = req?.body ?? {};
    const contractorId: string | undefined = body?.contractor_id;
    const timestamp: string | undefined = body?.timestamp;

    if (!contractorId) {
      throw new BadRequestException('contractor_id is required');
    }
    if (!timestamp) {
      throw new BadRequestException('timestamp is required');
    }

    const contractor = await this.userClient
      .send('findContractorById', contractorId)
      .toPromise();

    if (!contractor) {
      throw new BadRequestException('Contractor not found');
    }

    const workStartStr: string | null = contractor.work_schedule_start ?? null;
    const workEndStr: string | null = contractor.work_schedule_end ?? null;

    // Permitir si falta configuración completa de horario laboral
    if (!workStartStr || !workEndStr) {
      return next.handle();
    }

    const workStart = parseTimeToMinutes(workStartStr);
    const workEnd = parseTimeToMinutes(workEndStr);

    if (workStart === null || workEnd === null) {
      return next.handle();
    }

    // Almuerzo: lunch_start/lunch_end o lunch_time [start,end]
    let lunchStart: number | null = null;
    let lunchEnd: number | null = null;

    if (contractor.lunch_start && contractor.lunch_end) {
      lunchStart = parseTimeToMinutes(contractor.lunch_start);
      lunchEnd = parseTimeToMinutes(contractor.lunch_end);
    } else if (Array.isArray(contractor.lunch_time) && contractor.lunch_time.length === 2) {
      const [ls, le] = contractor.lunch_time as [string, string];
      lunchStart = parseTimeToMinutes(ls);
      lunchEnd = parseTimeToMinutes(le);
    }

    const ts = new Date(timestamp);
    if (isNaN(ts.getTime())) {
      throw new BadRequestException('invalid timestamp');
    }
    const currentMinutes = ts.getHours() * 60 + ts.getMinutes();

    const withinWork = isTimeInInterval(currentMinutes, workStart, workEnd);
    if (!withinWork) {
      throw new ForbiddenException('Contractor is out of the working hours');
    }

    if (lunchStart !== null && lunchEnd !== null) {
      const withinLunch = isTimeInInterval(currentMinutes, lunchStart, lunchEnd);
      if (withinLunch) {
        throw new ForbiddenException('Contractor is in lunch time');
      }
    }

    return next.handle();
  }
}


