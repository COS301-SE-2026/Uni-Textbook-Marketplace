import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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
import { SavedSearchesService } from '../saved_search/saved_search.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,

    private readonly savedSearchesService: SavedSearchesService,
  ) {}

  private async updateListingStatus(
    id: string,
    userId: string,
    status: ListingStatus,
    action: 'APPROVE_LISTING' | 'REJECT_LISTING',
    reason?: string,
  ) {
    const { savedlisting, listing, event } =
      await this.entityManager.transaction(async (manager) => {
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
          relations: ['seller'],
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
        event.studentId = listing.seller.id;
        event.name = `${listing.seller.first_name} ${listing.seller.last_name}`;
        event.studentEmail = listing.seller.email;
        this.eventEmitter.emit('listing.reviewed', event);

        return { savedlisting, listing, event };
      });

    if (action == 'APPROVE_LISTING') {
      this.checkSavedSearchMatches(listing).catch((error: unknown) => {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error('Error checking saved search matches:', errorMessage);
      });
    }

    return savedlisting;
  }

  private async getName(id: string) {
    const person = await this.usersRepository.findOneBy({ id });
    return person ? { name: person.first_name, email: person.email } : null;
  }

  private async checkSavedSearchMatches(listing: Listing): Promise<void> {
    try {
      const matches =
        await this.savedSearchesService.findMatchingSavedSearches(listing);

      if (matches.length === 0) {
        console.log(`No saved search matches found for listing ${listing.id}`);
        return;
      }

      for (const match of matches) {
        console.log(
          `User ${match.userId} has a saved search match for listing ${listing.id}`,
        );

        const user = await this.getName(match.userId);

        this.eventEmitter.emit('saved-search.match', {
          userId: match.userId,
          savedSearchId: match.savedSearchId,
          name: user?.name,
          studentEmail: user?.email,
          listingId: listing.id,
          listingTitle:
            listing.title ||
            'New Listing Available that matches your saved search',
          matchDate: new Date(),
        });

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(
        `Error checking saved search matches for listing ${listing.id}:`,
        errorMessage,
      );
    }
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

  async banUser(
    userId: string,
    adminId: string,
    reason: string,
  ): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.is_banned) {
      throw new BadRequestException('User is already banned');
    }

    const admin = await this.usersRepository.findOne({
      where: {
        id: adminId,
      },
    });

    if (!admin) {
      throw new NotFoundException('Admin user not found');
    }

    user.is_banned = true;
    user.banned_at = new Date();
    user.banned_by = admin;
    user.ban_reason = reason;

    //lets just return the users repo, safety issue
    const savedUser = await this.usersRepository.save(user);

    await this.auditLogRepository.save(
      this.auditLogRepository.create({
        entity_type: 'USER',
        entity_id: user.id,
        action: 'BAN_USER',
        performedBy: admin,
        reason,
        notes: `User ${user.email} was banned.`,
      }),
    );

    return savedUser;
  }
}
