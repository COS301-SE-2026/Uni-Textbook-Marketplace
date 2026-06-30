import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { AuditService } from './audit.service';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { User } from '../database/entities/users.entity';


interface AuthenticatedRequest extends Request {
  user?: User;
}

// Type guard functions
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function hasId(obj: unknown): obj is { id: string } {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    isString((obj as { id: unknown }).id)
  );
}

function isResponseWithId(value: unknown): value is { id: string } {
  return hasId(value);
}

function isArrayWithId(value: unknown): value is Array<{ id: string }> {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(item => hasId(item))
  );
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly auditService: AuditService,
    private readonly reflector: Reflector,
  ) {}

  intercept<T>(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<T> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    const entityType = this.reflector.get<string>(
      'entityType',
      context.getHandler(),
    );

    const action = this.reflector.get<string>(
      'action',
      context.getHandler(),
    );

    // No auditing required
    if (user?.role !== 'admin' || !entityType || !action) {
      return next.handle();
    }

    let entityId: string | undefined;

    // Check route parameter
    if (typeof request.params?.id === 'string') {
      entityId = request.params.id;
    }

    // Check request body
    if (!entityId && isString(request.body?.id)) {
      entityId = request.body.id;
    }

    return next.handle().pipe(
      mergeMap((response: T) =>
        from(
          (async (): Promise<T> => {
            let finalEntityId = entityId;

            if (!finalEntityId) {
              if (isResponseWithId(response)) {
                finalEntityId = response.id;
              } else if (isArrayWithId(response)) {
                finalEntityId = response[0].id;
              }
            }

            if (finalEntityId && user) {
              try {
                await this.auditService.logAction(
                  user,
                  entityType,
                  finalEntityId,
                  action,
                  `Performed by ${user.email}`,
                );
              } catch (error) {
                console.error('Failed to create audit log:', error);
              }
            }

            return response;
          })(),
        ),
      ),
    );
  }
}