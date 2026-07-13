import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../src/auth/auth.module';
import { ListingsModule } from '../src/listings/listings.module';
import { ModuleModule } from '../src/modules/module.module';
import { BooksModule } from '../src/books/books.module';
import { PassportModule } from '@nestjs/passport';
import { User } from '../src/database/entities/users.entity';
import { Listing } from '../src/database/entities/listing.entity';
import { Book } from '../src/database/entities/book.entity';
import { Module as ModuleEntity } from '../src/database/entities/module.entity';
import { University } from '../src/database/entities/university.entity';
import { OTP } from '../src/database/entities/otps.entity';
import { AuditLog } from '../src/database/entities/audit_log.entity';
import { Faculty } from '../src/database/entities/faculty.entity';

@Module({
    imports: [
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
                        User, Listing, Book, ModuleEntity, University, OTP, AuditLog, Faculty
                    ],
                    logging: false,
                };
            },
        }),
       
        AuthModule,
        ListingsModule,
        ModuleModule,
        BooksModule,
    ],
})
export class TestModule {}