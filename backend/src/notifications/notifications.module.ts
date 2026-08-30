import { Module } from '@nestjs/common';
import { ListingNotificationListener } from './listeners/listing.notification.listener';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notifications } from '../database/entities/notifications.entity';
import { SavedSearchMatchListener } from './listeners/saved-search-match.listener';
import { EMAIL_SERVICE } from '../email/email.interface';
import { MailtrapEmailProvider } from '../email/mailtrap-email.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Notifications])],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    ListingNotificationListener,
    SavedSearchMatchListener,
    {
      provide: EMAIL_SERVICE,
      useClass: MailtrapEmailProvider,
    },
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
