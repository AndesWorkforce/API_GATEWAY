import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
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
  private readonly logger = new Logger(RolesGuard.name);

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

    // If no rules declared, allow
    if (!requiredRoles.length && !allowClient) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as RequestUser | undefined;

    if (!user) {
      throw new UnauthorizedException('User not found in request');
    }

    // Log for debugging
    this.logger.debug(
      `RolesGuard check - userType: ${user.type}, allowClient: ${allowClient}, requiredRoles: ${requiredRoles.join(', ')}, userRole: ${user.role}`,
    );

    // Check if user is a client (case-insensitive comparison for safety)
    if (user.type?.toLowerCase() === 'client') {
      if (allowClient) {
        this.logger.debug('Client access granted via @AllowClient()');
        return true;
      }
      throw new ForbiddenException('Client does not have access to this route');
    }

    // User is not a client, check roles
    if (!requiredRoles.length) {
      // Route only for authenticated users without additional restriction
      this.logger.debug('User access granted - no role restrictions');
      return true;
    }

    // Check if user has required role
    if (!user.role || !requiredRoles.includes(user.role)) {
      this.logger.warn(
        `User ${user.id} (${user.email}) does not have required role. User role: ${user.role}, Required: ${requiredRoles.join(', ')}`,
      );
      throw new ForbiddenException('User does not have sufficient permissions');
    }

    this.logger.debug(`User access granted - role: ${user.role}`);
    return true;
  }
}
