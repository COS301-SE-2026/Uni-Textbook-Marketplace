import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notifications } from '../database/entities/notifications.entity';
import { Repository } from 'typeorm';
import { AdminEvent } from '../admin/events/admin.event';
import { EditEvent } from '../listings/events/edit.event';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notifications)
    private readonly notificationRepo: Repository<Notifications>,
  ) {}

  async create(event: AdminEvent) {
    const noti = this.notificationRepo.create({
      user_id: { id: event.studentId },
      entity_type: event.action,
      entity_id: { id: event.listingId },
      message_info: event.description,
    });

    await this.notificationRepo.save(noti);
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
}
