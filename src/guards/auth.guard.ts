import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClientProxy } from '@nestjs/microservices';
import { Request } from 'express';

import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Verificar si la ruta es pública
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token de autorización no proporcionado');
    }

    try {
      // Llamar al endpoint de validación en auth-ms
      const validationResult = await this.authClient
        .send('auth.validate', token)
        .toPromise();

      if (!validationResult.isValid) {
        throw new UnauthorizedException(
          validationResult.error || 'Token inválido',
        );
      }
      request['user'] = {
        id: validationResult.userId,
        email: validationResult.email,
        name: validationResult.name,
        isActive: validationResult.isActive,
        createdAt: validationResult.createdAt,
        updatedAt: validationResult.updatedAt,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Error al validar el token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
