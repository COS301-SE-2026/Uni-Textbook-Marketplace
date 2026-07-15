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

  async approveListing(id: string, userId: string) {
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

      listing.status = ListingStatus.APPROVED;
      listing.reviewer = admin;
      listing.reviewed_at = new Date();

      await listingRepository.save(listing);

      const auditLog = auditLogRepository.create({
        entity_type: 'listing',
        entity_id: listing.id,
        action: 'APPROVE_LISTING',
        performedBy: admin,
        notes: `Listing "${listing.title}" approved by ${admin.email}`,
      });
      await auditLogRepository.save(auditLog);

      return listing;
    });
  }

  async rejectListing(id: string, userId: string) {
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

      listing.status = ListingStatus.REJECTED;
      listing.reviewer = admin;
      listing.reviewed_at = new Date();

      await listingRepository.save(listing);

      const auditLog = auditLogRepository.create({
        entity_type: 'listing',
        entity_id: listing.id,
        action: 'REJECT_LISTING',
        performedBy: admin,
        notes: `Listing "${listing.title}" rejected by ${admin.email}`,
      });
      await auditLogRepository.save(auditLog);

      return listing;
    });
  }

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

  // Get audit log with filters
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

    // Filter by user who performed the action
    if (performedBy) {
      where.performedBy = { id: performedBy };
    }

    // Filter by action type
    if (action) {
      where.action = action;
    }

    // Filter by entity type
    if (entityType) {
      where.entity_type = entityType;
    }

    // Filter by specific entity ID
    if (entityId) {
      where.entity_id = entityId;
    }

    // Date range filter
    if (startDate && endDate) {
      where.performed_at = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.performed_at = Between(new Date(startDate), new Date());
    }

    // Search in notes
    if (search) {
      where.notes = ILike(`%${search}%`);
    }

    // Get paginated results
    const [logs, total] = await auditLogRepository.findAndCount({
      where,
      relations: ['performedBy'],
      order: {
        performed_at: 'DESC',
      },
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

  // Get audit log statistics
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

  // Get audit log by entity
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
