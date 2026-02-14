import {
  Injectable,
  ExecutionContext,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
Custom Throttler Guard para proporcionar mensajes de error más descriptivos
y logging cuando se supera el rate limit
 */
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  private readonly logger = new Logger(CustomThrottlerGuard.name);

  protected async throwThrottlingException(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const endpoint = `${request.method} ${request.url}`;

    this.logger.warn(
      `Rate limit exceeded for ${endpoint} from IP: ${request.ip}`,
    );

    throw new HttpException(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Too many requests. Please try again later.',
        error: 'Rate Limit Exceeded',
        details: {
          endpoint,
          suggestion:
            'You have exceeded the rate limit. Please wait before making additional requests.',
        },
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
