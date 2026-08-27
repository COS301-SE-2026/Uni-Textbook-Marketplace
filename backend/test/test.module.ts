import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AuthModule } from '../src/auth/auth.module';
import { ListingsModule } from '../src/listings/listings.module';
import { ModuleModule } from '../src/modules/module.module';
import { BooksModule } from '../src/books/books.module';
import { AdminModule } from '../src/admin/admin.module';
import { SavedSearchesModule } from '../src/saved_search/saved_search.module';
import { NotificationsModule } from '../src/notifications/notifications.module';

import { User } from '../src/database/entities/users.entity';
import { Listing } from '../src/database/entities/listing.entity';
import { Book } from '../src/database/entities/book.entity';
import { Module as ModuleEntity } from '../src/database/entities/module.entity';
import { University } from '../src/database/entities/university.entity';
import { OTP } from '../src/database/entities/otps.entity';
import { AuditLog } from '../src/database/entities/audit_log.entity';
import { Faculty } from '../src/database/entities/faculty.entity';
import { SavedSearch } from '../src/database/entities/saved_search.entity';
import { MessagingModule } from '../src/messaging/messaging.module';
import { Notifications } from '../src/database/entities/notifications.entity';
import { Wishlist } from '../src/database/entities/wishlist.entity';
import { Report } from '../src/database/entities/report.entity';
import { SavedSearchMatchListener } from '../src/notifications/listeners/saved-search-match.listener';

@Module({
    imports: [
        EventEmitterModule.forRoot(),
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env.test',
        }),
        PassportModule,
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                const dbUrl = config.get<string>('DATABASE_URL');
                console.log('TestModule - DATABASE_URL:', dbUrl);
                return {
                    type: 'postgres',
                    url: dbUrl,
                    synchronize: true,
                    dropSchema: true,
                    entities: [
                        User, Listing, Book, ModuleEntity, University, OTP, AuditLog, Faculty, SavedSearch,Notifications, Wishlist,Report,
                    ],
                    logging: false,
                };
            },
        }),
        AuthModule,
        ListingsModule,
        ModuleModule,
        BooksModule,
        AdminModule,
        SavedSearchesModule,
        MessagingModule,
         NotificationsModule,
    ],
    providers: [SavedSearchMatchListener],
})
export class TestModule {}