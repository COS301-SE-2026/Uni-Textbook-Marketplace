import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notifications } from '../database/entities/notifications.entity'
import { Repository } from 'typeorm';
import { AdminEvent } from '../admin/events/admin.event';

@Injectable()
export class NotificationsService {

    constructor(
        @InjectRepository(Notifications)
        private readonly notificationRepo: Repository<Notifications>,
    ) { }

    async create(event: AdminEvent) {

        const noti = this.notificationRepo.create({
            user_id: { id: event.studentId },
            entity_type: event.action,
            entity_id: { id: event.listingId },
            message_info: event.description,
        });

        await this.notificationRepo.save(noti);
    }

    async mynotifications(userId: string) {

        const notifications = await this.notificationRepo.find({
            where: { user_id: { id: userId } },
            relations: ['entity_id']
        });

        if (notifications.length === 0) throw new NotFoundException;

        return notifications;
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
}
