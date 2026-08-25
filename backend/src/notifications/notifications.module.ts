import { Module } from '@nestjs/common';
import { ListingNotificationListener } from './listeners/listing.notification.listener';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notifications } from '../database/entities/notifications.entity';
import { User } from 'src/database/entities/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notifications, User])],
  controllers: [NotificationsController],
  providers: [NotificationsService, ListingNotificationListener],
  exports: [NotificationsService],
})
export class NotificationsModule {}
