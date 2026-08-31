import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notifications } from '../database/entities/notifications.entity';
import { Repository } from 'typeorm';
import { AdminEvent } from '../admin/events/admin.event';
import { EditEvent } from '../listings/events/edit.event';
import { MessageEvent } from '../messaging/events/message.event';
import { SavedSearchMatchEvent } from '../saved_search/events/saved-search-match.event';
import { EMAIL_SERVICE, IEmailService } from '../email/email.interface';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notifications)
    private readonly notificationRepo: Repository<Notifications>,

    @Inject(EMAIL_SERVICE)
    private readonly emailService: IEmailService,
  ) {}

  //for notifying student of their listing
  async create(event: AdminEvent) {
    const noti = this.notificationRepo.create({
      user_id: { id: event.studentId },
      entity_type: event.action,
      entity_id: { id: event.listingId },
      message_info: event.description,
    });

    await this.notificationRepo.save(noti);

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
    }

    await this.emailService.sendNotificationEmail(
      event.studentEmail,
      event.action,
      {
        recipientName: event.name,
        listingTitle: event.title,
      },
    );
  }

  async createFromSavedSearch(event: SavedSearchMatchEvent) {
    const noti = this.notificationRepo.create({
      user_id: { id: event.userId },
      entity_type: 'SAVED_SEARCH_MATCH',
      entity_id: { id: event.listingId },
      message_info: `New listing "${event.listingTitle}" matches your saved search!`,
    });
    await this.notificationRepo.save(noti);

    await this.emailService.sendNotificationEmail(
      event.studentEmail,
      'SAVED_SEARCH_MATCH',
      {
        recipientName: event.name,
        listingTitle: event.listingTitle,
      },
    );
  }

  async mynotifications(userId: string, page: number = 1, limit: number = 10) {
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

    return {
      data: notifications,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
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

    await this.notificationRepo.save(noti);
  }

  async notifyStudentofMessage(event: MessageEvent) {
    const noti = this.notificationRepo.create({
      user_id: { id: event.userId },
      notification_from: { id: event.notificationfrom },
      entity_type: event.entityType,
      message_info: event.messageInfo,
    });

    await this.notificationRepo.save(noti);

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
}
