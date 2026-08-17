import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AdminEvent } from '../../admin/events/admin.event';
import { NotificationsService } from '../notifications.service';
import { EditEvent } from '../../listings/events/edit.event';

@Injectable()
export class ListingNotificationListener {
  constructor(private readonly notificationsService: NotificationsService) {}

  @OnEvent('listing.reviewed')
  notifyStudentOfReview(event: AdminEvent) {
    this.notificationsService.create(event);
  }

  @OnEvent('listing.edit')
  notifyAdminofEdit(event: EditEvent) {
    this.notificationsService.notifyAdmin(event);
  }
}
