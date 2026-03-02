import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Role } from '../common/enums/role.enum';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import {
  AGENT_ONLY_KEY,
  ALLOW_CLIENT_KEY,
  ROLES_KEY,
} from '../decorators/roles.decorator';

interface RequestUser {
  id: string;
  email: string;
  name: string;
  type: 'user' | 'client' | 'agent';
  role: Role | null;
  extraRoles?: Role[] | null;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const handler = context.getHandler() as (...args: any[]) => any;
    const controller = context.getClass() as new (...args: any[]) => any;

    // Check if route is public - if so, allow access
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      handler,
      controller,
    ]);

    if (isPublic) {
      return true;
    }

    // Rutas sólo para el agente técnico (userType: 'agent')
    const agentOnly = this.reflector.getAllAndOverride<boolean>(
      AGENT_ONLY_KEY,
      [handler, controller],
    );
    if (agentOnly) {
      const user = this.getUserFromRequest(context);
      if (!user || user.type?.toLowerCase() !== 'agent') {
        throw new ForbiddenException(
          'Route accessible only to agent principal',
        );
      }
      return true;
    }

    const requiredRoles = this.getRequiredRoles(handler, controller);
    const allowClient = this.getAllowClient(handler, controller);

    if (!requiredRoles.length && !allowClient) {
      return true;
    }

    const user = this.getUserFromRequest(context);
    if (!user) {
      throw new UnauthorizedException('User not found in request');
    }

    if (this.isClient(user)) {
      return this.checkClientAccess(allowClient);
    }

    return this.checkUserAccess(user, requiredRoles, allowClient);
  }

  private getRequiredRoles(
    handler: (...args: any[]) => any,
    controller: new (...args: any[]) => any,
  ): Role[] {
    return (
      this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
        handler,
        controller,
      ]) || []
    );
  }

  private getAllowClient(
    handler: (...args: any[]) => any,
    controller: new (...args: any[]) => any,
  ): boolean {
    const allowClientOnHandler = this.reflector.get<boolean>(
      ALLOW_CLIENT_KEY,
      handler,
    );
    const hasRolesOnHandler = this.reflector.get<Role[]>(ROLES_KEY, handler);

    if (hasRolesOnHandler && allowClientOnHandler === undefined) {
      return false;
    }

    return (
      this.reflector.getAllAndOverride<boolean>(ALLOW_CLIENT_KEY, [
        handler,
        controller,
      ]) ?? false
    );
  }

  private getUserFromRequest(
    context: ExecutionContext,
  ): RequestUser | undefined {
    const request = context.switchToHttp().getRequest();
    return request.user as RequestUser | undefined;
  }

  private isClient(user: RequestUser): boolean {
    const t = user.type?.toLowerCase();
    // Consider both real clients and agents as "client-like" for routes marked with @AllowClient()
    return t === 'client' || t === 'agent';
  }

  private checkClientAccess(allowClient: boolean): boolean {
    if (allowClient) {
      return true;
    }
    throw new ForbiddenException('Client does not have access to this route');
  }

  private checkUserAccess(
    user: RequestUser,
    requiredRoles: Role[],
    allowClient: boolean,
  ): boolean {
    if (allowClient && !requiredRoles.length) {
      throw new ForbiddenException('This route is only accessible to clients');
    }

    if (!requiredRoles.length) {
      return true;
    }

    const userRoles: Role[] = [];
    if (user.role) {
      userRoles.push(user.role);
    }
    if (user.extraRoles && Array.isArray(user.extraRoles)) {
      userRoles.push(...user.extraRoles);
    }
    const hasRequiredRole = requiredRoles.some((requiredRole) =>
      userRoles.includes(requiredRole),
    );
    if (!hasRequiredRole) {
      throw new ForbiddenException('User does not have sufficient permissions');
    }

    return true;
  }
}
