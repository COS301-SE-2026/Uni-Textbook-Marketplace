import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { AuditService } from './audit.service';
import { User } from '../database/entities/users.entity';

interface AuthenticatedRequest extends Request {
  user?: User;
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

   
    if (
      user?.role !== 'admin' ||
      !entityType ||
      !action ||
      typeof request.params?.id !== 'string'
    ) {
      return next.handle();
    }

    const entityId = request.params.id;

    return next.handle().pipe(
      mergeMap((response: T) =>
        from(
          (async (): Promise<T> => {
            try {
              await this.auditService.logAction(
                user,
                entityType,
                entityId,
                action,
                `Performed by ${user.email}`,
              );
            } catch (error) {
              console.error('Failed to create audit log:', error);
            }

            return response;
          })(),
        ),
      ),
    );
  }
}