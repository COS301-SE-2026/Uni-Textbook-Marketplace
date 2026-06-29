// interceptors/audit.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuditService } from './audit.service';
import { Reflector } from '@nestjs/core';
import { User } from 'src/database/entities/users.entity';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: User;
  params: {
    id?: string;
    [key: string]: any;
  };
  body: {
    id?: string;
    [key: string]: any;
  };
}

// Define a generic type for the response
type ResponseType = Record<string, any> | any[] | null | undefined;

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private auditService: AuditService,
    private reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Get the request with proper typing
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    // Get metadata from the decorator
    const entityType = this.reflector.get<string>(
      'entityType',
      context.getHandler(),
    );
    const action = this.reflector.get<string>('action', context.getHandler());

    // Only log if we have an admin user and required metadata
    if (user?.role === 'admin' && entityType && action) {
      // Get entity ID from various possible locations
      const entityId = request.params?.id || request.body?.id;

      // Use switchMap to properly handle async operations
      return next.handle().pipe(
        switchMap(async (response: ResponseType): Promise<ResponseType> => {
          try {
            const finalEntityId = entityId;

            if (finalEntityId) {
              await this.auditService.logAction(
                user,
                entityType,
                finalEntityId,
                action,
                `Performed by ${user.email} (${user.id})`,
              );
            } else {
              console.warn(
                `Audit log warning: No entity ID found for ${entityType} ${action}`,
              );
            }
          } catch (error) {
            console.error('Failed to create audit log:', error);
          }

          // Return the response with proper typing
          return response;
        }),
        catchError((error: Error): Observable<never> => {
          console.error('Error in intercepted request:', error);
          throw error;
        }),
      );
    }

    // If no logging needed, just continue
    return next.handle();
  }
}
