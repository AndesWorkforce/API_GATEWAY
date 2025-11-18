import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Role } from '../common/roles.enum';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Respect public routes
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Deny by default: if no roles metadata defined, reject access
    if (!requiredRoles || requiredRoles.length === 0) {
      throw new ForbiddenException(
        'No tienes permisos para acceder a esta ruta',
      );
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user || {};
    const userRole = user.role;

    if (!userRole) {
      throw new ForbiddenException(
        'No tienes permisos para acceder a esta ruta',
      );
    }

    if (!requiredRoles.includes(userRole)) {
      throw new ForbiddenException(
        'No tienes permisos para acceder a esta ruta',
      );
    }

    return true;
  }
}
