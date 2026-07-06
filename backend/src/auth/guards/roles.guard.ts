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
    console.log('RolesGuard: Checking roles...'); // Debug

    // Use the constant instead of string literal
    const roles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());
    console.log('RolesGuard: Required roles:', roles);

    // If no roles are required, allow access
    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    // Check if user exists
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user has required role
    const hasRole = roles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException(
        'Insufficient permissions. Admin role required.',
      );
    }

    return true;
  }
}
