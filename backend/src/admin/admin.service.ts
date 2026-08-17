import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import {
  EntityManager,
  Between,
  ILike,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { User } from '../database/entities/users.entity';
import { Listing, ListingStatus } from '../database/entities/listing.entity';
import { AuditLog } from '../database/entities/audit_log.entity';
import { AuditLogFiltersDto } from './dto/audit-log-filters.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AdminEvent } from './events/admin.event';

@Injectable()
export class AdminService {
  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private readonly eventEmitter: EventEmitter2,
  ) {}

  private async updateListingStatus(
    id: string,
    userId: string,
    status: ListingStatus,
    action: 'APPROVE_LISTING' | 'REJECT_LISTING',
    reason?: string,
  ) {
    return await this.entityManager.transaction(async (manager) => {
      const listingRepository = manager.getRepository(Listing);
      const auditLogRepository = manager.getRepository(AuditLog);
      const userRepository = manager.getRepository(User);

      const admin = await userRepository.findOne({
        where: { id: userId },
      });

      if (!admin) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      const listing = await listingRepository.findOne({
        where: { id },
      });

      if (!listing) {
        throw new NotFoundException(`Listing with ID ${id} not found`);
      }

      listing.status = status;
      listing.reviewer = admin;
      listing.reviewed_at = new Date();

      const savedlisting = await listingRepository.save(listing);

      const auditLog = auditLogRepository.create({
        entity_type: 'listing',
        entity_id: listing.id,
        action: action,
        performedBy: admin,
        notes: listing.title,
        reason: reason,
      });

      await auditLogRepository.save(auditLog);

      const event = new AdminEvent();
      event.title = listing.title;
      event.action = action;
      event.description = reason ?? 'Your listing is now approved and live.';
      event.listingId = listing.id;
      event.studentId = userId;
      event.name = `${admin.first_name} ${admin.last_name}`;

      this.eventEmitter.emit('listing.reviewed', event);

      return savedlisting;
    });
  }

  async approveListing(id: string, userId: string) {
    return this.updateListingStatus(
      id,
      userId,
      ListingStatus.APPROVED,
      'APPROVE_LISTING',
    );
  }

  async rejectListing(id: string, userId: string, reason: string) {
    return this.updateListingStatus(
      id,
      userId,
      ListingStatus.REJECTED,
      'REJECT_LISTING',
      reason,
    );
  }

  async getAuditLog(filters: AuditLogFiltersDto) {
    const {
      performedBy,
      action,
      entityType,
      entityId,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      search,
    } = filters;

    const auditLogRepository = this.entityManager.getRepository(AuditLog);
    const where: FindOptionsWhere<AuditLog> = {};

    if (performedBy) {
      where.performedBy = { id: performedBy };
    }
    if (action) {
      where.action = action;
    }
    if (entityType) {
      where.entity_type = entityType;
    }
    if (entityId) {
      where.entity_id = entityId;
    }
    if (startDate && endDate) {
      where.performed_at = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.performed_at = Between(new Date(startDate), new Date());
    }
    if (search) {
      where.notes = ILike(`%${search}%`);
    }

    const [logs, total] = await auditLogRepository.findAndCount({
      where,
      relations: ['performedBy'],
      order: { performed_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getusersAdmin() {
    return await this.usersRepository.find({
      select: {
        id: true,
        email: true,
      },
      where: {
        role: 'admin',
      },
    });
  }
}
