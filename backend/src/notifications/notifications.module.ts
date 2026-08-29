import { Module } from '@nestjs/common';
import { ListingNotificationListener } from './listeners/listing.notification.listener';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notifications } from '../database/entities/notifications.entity';
import { User } from '../database/entities/users.entity';
import { ReportNotificationListener } from './listeners/report.notification.listener';
import { SavedSearchMatchListener } from './listeners/saved-search-match.listener';

@Module({
  imports: [TypeOrmModule.forFeature([Notifications, User])],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    ListingNotificationListener,
    SavedSearchMatchListener,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
