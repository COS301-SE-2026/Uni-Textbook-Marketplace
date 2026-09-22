import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';

import { Listing } from '../database/entities/listing.entity';
import { User } from '../database/entities/users.entity';
import { MessagingGateway } from './messaging.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Listing, User]), AuthModule],
  controllers: [MessagingController],
  providers: [MessagingService, MessagingGateway],
  exports: [MessagingService],
})
export class MessagingModule {}
