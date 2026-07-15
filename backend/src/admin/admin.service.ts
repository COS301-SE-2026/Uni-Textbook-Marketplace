import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, Between, ILike, FindOptionsWhere } from 'typeorm';
import { User } from '../database/entities/users.entity';
import { Listing, ListingStatus } from '../database/entities/listing.entity';
import { AuditLog } from '../database/entities/audit_log.entity';
import { AuditLogFiltersDto } from '../audit/dto/audit-log-filters.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
  ) {}

  
  private async updateListingStatus(
    id: string,
    userId: string,
    status: ListingStatus,
    action: 'APPROVE_LISTING' | 'REJECT_LISTING',
  ) {
    return await this.entityManager.transaction(async (manager) => {
      const listingRepository = manager.getRepository(Listing);
      const auditLogRepository = manager.getRepository(AuditLog);
      const userRepository = manager.getRepository(User);

      // Get the admin user
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

      // Update listing status
      listing.status = status;
      listing.reviewer = admin;
      listing.reviewed_at = new Date();

      await listingRepository.save(listing);

      // Create audit log
      const actionVerb = status === ListingStatus.APPROVED ? 'approved' : 'rejected';
      const auditLog = auditLogRepository.create({
        entity_type: 'listing',
        entity_id: listing.id,
        action: action,
        performedBy: admin,
        notes: `Listing "${listing.title}" ${actionVerb} by ${admin.email}`,
      });

      await auditLogRepository.save(auditLog);

      return listing;
    });
  }


  async approveListing(id: string, userId: string) {
    return this.updateListingStatus(id, userId, ListingStatus.APPROVED, 'APPROVE_LISTING');
  }

  async rejectListing(id: string, userId: string) {
    return this.updateListingStatus(id, userId, ListingStatus.REJECTED, 'REJECT_LISTING');
  }

  // ... rest of the methods remain the same
  async getPendingListings() {
    const listingRepository = this.entityManager.getRepository(Listing);
    return await listingRepository.find({
      where: { status: ListingStatus.PENDING },
      relations: ['seller', 'book', 'module'],
      order: { created_at: 'ASC' },
    });
  }

  async getListingById(id: string) {
    const listingRepository = this.entityManager.getRepository(Listing);
    const listing = await listingRepository.findOne({
      where: { id },
      relations: ['seller', 'book', 'module', 'reviewer'],
    });

    if (!listing) {
      throw new NotFoundException(`Listing with ID ${id} not found`);
    }

    return listing;
  }

  async getListingsByStatus(status: ListingStatus) {
    const listingRepository = this.entityManager.getRepository(Listing);
    return await listingRepository.find({
      where: { status },
      relations: ['seller', 'book', 'module'],
      order: { created_at: 'DESC' },
    });
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

  async logAction(data: {
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    notes?: string;
  }) {
    const auditLogRepository = this.entityManager.getRepository(AuditLog);
    const log = auditLogRepository.create({
      performedBy: { id: data.userId },
      action: data.action,
      entity_type: data.entityType,
      entity_id: data.entityId,
      notes: data.notes,
    });
    return await auditLogRepository.save(log);
  }

  async getAuditLogStats() {
    const auditLogRepository = this.entityManager.getRepository(AuditLog);

    const totalLogs = await auditLogRepository.count();

    const actionStats = await auditLogRepository
      .createQueryBuilder('audit_log')
      .select('audit_log.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit_log.action')
      .getRawMany();

    const dailyStats = await auditLogRepository
      .createQueryBuilder('audit_log')
      .select('DATE(audit_log.performed_at)', 'date')
      .addSelect('COUNT(*)', 'count')
      .groupBy('DATE(audit_log.performed_at)')
      .orderBy('date', 'DESC')
      .limit(30)
      .getRawMany();

    return {
      totalLogs,
      actionStats,
      dailyStats,
    };
  }

  async getAuditLogByEntity(entityType: string, entityId: string) {
    const auditLogRepository = this.entityManager.getRepository(AuditLog);
    return await auditLogRepository.find({
      where: {
        entity_type: entityType,
        entity_id: entityId,
      },
      relations: ['performedBy'],
      order: {
        performed_at: 'DESC',
      },
    });
  }
}