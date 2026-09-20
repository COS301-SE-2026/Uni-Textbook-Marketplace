import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { ListingsModule } from './listings/listings.module';
import { ModuleModule } from './modules/module.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { CasesModule } from './cases/cases.module';
import { User } from './database/entities/users.entity';
import { Listing } from './database/entities/listing.entity';
import { Book } from './database/entities/book.entity';
import { Module as ModuleEntity } from './database/entities/module.entity';
import { University } from './database/entities/university.entity';
import { OTP } from './database/entities/otps.entity';
import { AuditLog } from './database/entities/audit_log.entity';
import { BooksModule } from './books/books.module';
import { Faculty } from './database/entities/faculty.entity';
import { Wishlist } from './database/entities/wishlist.entity';
import { Notifications } from './database/entities/notifications.entity';
import { SavedSearch } from './database/entities/saved_search.entity';
import { Report } from './database/entities/report.entity';
import { Case } from './database/entities/case.entity';
import { AzureModule } from './azure/azure.module';
import { AdminModule } from './admin/admin.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MessagingModule } from './messaging/messaging.module';
import { ReportsModule } from './reports/reports.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Auction } from './database/entities/auction.entity';
import { Bid } from './database/entities/bid.entity';
import { AuctionModule } from './auction/auction.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: Number(process.env.REDIS_PORT ?? 6379),
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        synchronize: false,
        logging: false,
        entities: [
          User,
          Listing,
          Book,
          ModuleEntity,
          University,
          OTP,
          AuditLog,
          Faculty,
          Wishlist,
          Notifications,
          SavedSearch,
          Report,
          Case,
          Auction,
          Bid,
        ],
        migrations: ['dist/database/migrations/*.js'],
        migrationsRun: true,
      }),
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    AuthModule,
    ListingsModule,
    ModuleModule,
    BooksModule,
    WishlistModule,
    AzureModule,
    NotificationsModule,
    AdminModule,
    MessagingModule,
    ReportsModule,
    CasesModule,
    AuctionModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
