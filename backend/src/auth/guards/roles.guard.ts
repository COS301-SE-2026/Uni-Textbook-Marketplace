import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorator/roles.decorator';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

interface RequestWithUser {
  user: AuthenticatedUser;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    console.log('RolesGuard: Checking roles...');

    // Get the roles metadata - could be string or array
    const rolesMetadata = this.reflector.get<string | string[]>(
      ROLES_KEY,
      context.getHandler(),
    );

    console.log('RolesGuard: Raw roles metadata:', rolesMetadata);

    // Normalize to array (handles both single string and array)
    let requiredRoles: string[] = [];
    if (typeof rolesMetadata === 'string') {
      requiredRoles = [rolesMetadata]; // Convert single string to array
    } else if (Array.isArray(rolesMetadata)) {
      requiredRoles = rolesMetadata;
    } else {
      // No roles required
      return true;
    }

    console.log('RolesGuard: Required roles:', requiredRoles);

    // If no roles are required, allow access
    if (requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    // Check if user exists
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user has any of the required roles
    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Insufficient permissions. Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    console.log('RolesGuard: Access granted');
    return true;
  }
}
