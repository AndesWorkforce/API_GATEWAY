import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Role } from '../common/enums/role.enum';
import { ALLOW_CLIENT_KEY, ROLES_KEY } from '../decorators/roles.decorator';

interface RequestUser {
  id: string;
  email: string;
  name: string;
  type: 'user' | 'client';
  role: Role | null;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles =
      this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || [];

    const allowClient =
      this.reflector.getAllAndOverride<boolean>(ALLOW_CLIENT_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? false;

    if (!requiredRoles.length && !allowClient) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as RequestUser | undefined;

    if (!user) {
      throw new UnauthorizedException('User not found in request');
    }

    if (user.type?.toLowerCase() === 'client') {
      if (allowClient) {
        return true;
      }
      throw new ForbiddenException('Client does not have access to this route');
    }

    if (allowClient && !requiredRoles.length) {
      throw new ForbiddenException('This route is only accessible to clients');
    }
    if (!requiredRoles.length) {
      return true;
    }
    if (!user.role || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('User does not have sufficient permissions');
    }

    return true;
  }
}
