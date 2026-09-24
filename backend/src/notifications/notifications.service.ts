import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notifications } from '../database/entities/notifications.entity';
import { In, Repository } from 'typeorm';
import { AdminEvent } from '../admin/events/admin.event';
import { EditEvent } from '../listings/events/edit.event';
import { MessageEvent } from '../messaging/events/message.event';
import { ReportEvent } from '../reports/events/report.events';
import { User } from '../database/entities/users.entity';
import { SavedSearchMatchEvent } from '../saved_search/events/saved-search-match.event';
import { EMAIL_SERVICE, IEmailService } from '../email/email.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface AuctionEndedNotification {
  sellerId: string | null;
  bidderId: string | null;
  listingId: string | null;
  listingTitle: string;
  outcome: 'SOLD' | 'RESERVE_NOT_MET' | 'NO_BIDS';
  finalBid: number | null;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notifications)
    private readonly notificationRepo: Repository<Notifications>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @Inject(EMAIL_SERVICE)
    private readonly emailService: IEmailService,

    private readonly eventEmitter: EventEmitter2,
  ) {}

  //for notifying student of their listing
  async create(event: AdminEvent) {
    const noti = this.notificationRepo.create({
      user_id: { id: event.studentId },
      entity_type: event.action,
      entity_id: { id: event.listingId },
      message_info: event.description,
    });

    const savedNotification = await this.notificationRepo.save(noti);

    this.eventEmitter.emit('notification.created', {
      userId: event.studentId,
      notificationId: savedNotification.id,
    });

    if (event.action == 'REJECT_LISTING') {
      await this.emailService.sendNotificationEmail(
        event.studentEmail,
        event.action,
        {
          recipientName: event.name,
          listingTitle: event.title,
          reason: event.description,
        },
      );
    } else {
      await this.emailService.sendNotificationEmail(
        event.studentEmail,
        event.action,
        {
          recipientName: event.name,
          listingTitle: event.title,
        },
      );
    }
  }

  async createFromSavedSearch(event: SavedSearchMatchEvent) {
    const noti = this.notificationRepo.create({
      user_id: { id: event.userId },
      entity_type: 'SAVED_SEARCH_MATCH',
      entity_id: { id: event.listingId },
      message_info: `New listing "${event.listingTitle}" matches your saved search!`,
    });
    const savedNotification = await this.notificationRepo.save(noti);

    this.eventEmitter.emit('notification.created', {
      userId: event.userId,
      notificationId: savedNotification.id,
    });

    await this.emailService.sendNotificationEmail(
      event.studentEmail,
      'SAVED_SEARCH_MATCH',
      {
        recipientName: event.name,
        listingTitle: event.listingTitle,
      },
    );
  }

  async notifyAuctionEnded(event: AuctionEndedNotification) {
    const recipientIds = [event.sellerId, event.bidderId].filter(
      (id, index, ids): id is string =>
        Boolean(id) && ids.indexOf(id) === index,
    );
    const recipients = recipientIds.length
      ? await this.userRepo.find({ where: { id: In(recipientIds) } })
      : [];

    for (const recipient of recipients) {
      const isSeller = recipient.id === event.sellerId;
      let message: string;
      if (isSeller) {
        if (event.outcome === 'SOLD') {
          message = `Your auction for "${event.listingTitle}" ended with a successful sale.`;
        } else if (event.outcome === 'RESERVE_NOT_MET') {
          message = `Your auction for "${event.listingTitle}" ended without a sale because the reserve price was not met.`;
        } else {
          message = `Your auction for "${event.listingTitle}" ended without any bids.`;
        }
      } else if (event.outcome === 'SOLD') {
        message = `You won the auction for "${event.listingTitle}".`;
      } else {
        message = `You were the highest bidder for "${event.listingTitle}", but the reserve price was not met.`;
      }

      const notification = this.notificationRepo.create({
        user_id: { id: recipient.id },
        entity_type: 'AUCTION_ENDED',
        entity_id: event.listingId ? { id: event.listingId } : undefined,
        message_info: message,
      });
      const savedNotification = await this.notificationRepo.save(notification);

      this.eventEmitter.emit('notification.created', {
        userId: recipient.id,
        notificationId: savedNotification.id,
      });

      await this.emailService.sendNotificationEmail(
        recipient.email,
        'AUCTION_ENDED',
        {
          recipientName: recipient.first_name,
          listingTitle: event.listingTitle,
          outcome: event.outcome,
          finalBid: event.finalBid,
          isSeller,
        },
      );
    }
  }

  async mynotifications(userId: string, page: number = 1, limit: number = 5) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await this.notificationRepo.findAndCount({
      where: { user_id: { id: userId } },
      relations: ['entity_id', 'user_id', 'notification_from'],
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    if (notifications.length === 0)
      throw new NotFoundException('No notifications found');

    const unread = await this.notificationRepo.count({
      where: {
        user_id: { id: userId },
        is_read: false,
      },
    });

    return {
      data: notifications,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      unreadCount: unread,
    };
  }

  async readNoti(userId: string, id: string) {
    const notifications = await this.notificationRepo.update(
      {
        id,
        user_id: { id: userId },
      },
      {
        is_read: true,
      },
    );

    return { updated: notifications.affected ?? 0 };
  }

  async readAll(userId: string) {
    const notifications = await this.notificationRepo.update(
      {
        user_id: { id: userId },
      },
      {
        is_read: true,
      },
    );

    return { updated: notifications.affected ?? 0 };
  }

  async notifyAdmin(event: EditEvent) {
    const noti = this.notificationRepo.create({
      user_id: { id: event.adminId },
      notification_from: { id: event.studentId },
      entity_type: event.entityType,
      entity_id: { id: event.listingId },
      message_info: event.message,
    });

    const savedNotification = await this.notificationRepo.save(noti);

    this.eventEmitter.emit('notification.created', {
      userId: event.adminId,
      notificationId: savedNotification.id,
    });
  }

  async notifyStudentofMessage(event: MessageEvent) {
    const noti = this.notificationRepo.create({
      user_id: { id: event.userId },
      notification_from: { id: event.notificationfrom },
      entity_type: event.entityType,
      message_info: event.messageInfo,
    });

    const savedNotification = await this.notificationRepo.save(noti);

    this.eventEmitter.emit('notification.created', {
      userId: event.userId,
      notificationId: savedNotification.id,
    });

    await this.emailService.sendNotificationEmail(
      event.studentEmail,
      event.entityType,
      {
        recipientName: event.name,
        listingTitle: event.listingTitle,
        senderName: event.messageFrom,
      },
    );
  }

  async deleteNotification(userId: string, notificationId: string) {
    const notification = await this.notificationRepo.findOne({
      where: {
        id: notificationId,
        user_id: { id: userId },
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.notificationRepo.remove(notification);

    return 'Notification successfuly deleted';
  }

  async emit(event: ReportEvent) {
    if (event.action === 'REPORT_CREATED') {
      //admins
      const admins = await this.userRepo.find({
        where: {
          role: 'admin',
        },
      });

      const notification = admins.map((admin) =>
        this.notificationRepo.create({
          user_id: admin,
          notification_from: { id: event.reporterId },
          entity_type: event.action,
          entity_id: { id: event.listingId },
          message_info: event.message,
        }),
      );

      const savedNotification = await this.notificationRepo.save(notification);

      for (const notification of savedNotification) {
        this.eventEmitter.emit('notification.created', {
          userId: notification.user_id.id,
          notificationId: notification.id,
        });
      }

      return;
    }

    const notification = this.notificationRepo.create({
      user_id: { id: event.reporterId },
      entity_type: event.action,
      entity_id: { id: event.listingId },
      message_info: event.message,
    });

    const savedNotification = await this.notificationRepo.save(notification);

    this.eventEmitter.emit('notification.created', {
      userId: event.reporterId,
      notificationId: savedNotification.id,
    });
  }
}
