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

    const rolesMetadata = this.reflector.get<string | string[]>(
      ROLES_KEY,
      context.getHandler(),
    );

    let requiredRoles: string[] = [];
    if (typeof rolesMetadata === 'string') {
      requiredRoles = [rolesMetadata]; // Convert single string to array
    } else if (Array.isArray(rolesMetadata)) {
      requiredRoles = rolesMetadata;
    } else {
      return true;
    }

    if (requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Insufficient permissions. Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
