import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { AuditLog } from '../database/entities/audit_log.entity';
import { User } from '../database/entities/users.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async logAction(
    performedBy: User,
    entityType: string,
    entityId: string,
    action: string,
    notes?: string,
  ): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create({
      performedBy,
      entity_type: entityType,
      entity_id: entityId,
      action,
      notes: notes,
    });

    return await this.auditLogRepository.save(auditLog);
  }

  // Transaction-safe version
  async logActionWithTransaction(
    manager: EntityManager,
    performedBy: User,
    entityType: string,
    entityId: string,
    action: string,
    notes?: string,
  ): Promise<AuditLog> {
    const auditLog = manager.create(AuditLog, {
      performedBy,
      entity_type: entityType,
      entity_id: entityId,
      action,
      notes: notes,
    });

    return await manager.save(auditLog);
  }
}
