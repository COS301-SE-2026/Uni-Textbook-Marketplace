import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AdminEvent } from '../../admin/events/admin.event';
import { NotificationsService } from '../notifications.service';
import { EditEvent } from '../../listings/events/edit.event';
import { MessageEvent } from '../../messaging/events/message.event';

@Injectable()
export class ListingNotificationListener {
  constructor(private readonly notificationsService: NotificationsService) {}

  @OnEvent('listing.reviewed')
  async notifyStudentOfReview(event: AdminEvent) {
    await this.notificationsService.create(event);
  }

  @OnEvent('listing.edit')
  async notifyAdminofEdit(event: EditEvent) {
    await this.notificationsService.notifyAdmin(event);
  }

  @OnEvent('messaging')
  async notifyStudentofMessage(event: MessageEvent) {
    await this.notificationsService.notifyStudentofMessage(event);
  }
}
