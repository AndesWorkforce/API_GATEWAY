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
  private static readonly GLOBAL_LOGIN_THROTTLE_KEY = 'global-auth-login-lock';

  protected generateKey(
    context: ExecutionContext,
    suffix: string,
    name: string,
  ): string {
    const request = context.switchToHttp().getRequest();
    const requestPath =
      request?.originalUrl || request?.url || request?.route?.path;
    const isGlobalLoginThrottle =
      request?.method === 'POST' &&
      (requestPath === '/auth/login' || request?.route?.path === 'login');

    if (isGlobalLoginThrottle) {
      return super.generateKey(
        context,
        CustomThrottlerGuard.GLOBAL_LOGIN_THROTTLE_KEY,
        name,
      );
    }

    return super.generateKey(context, suffix, name);
  }

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
