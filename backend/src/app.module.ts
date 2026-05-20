import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { ListingsModule } from './listings/listings.module';
import { ModuleModule } from './modules/module.module';

import { User } from './database/entities/users.entity';
import { Listing } from './database/entities/listing.entity';
import { Book } from './database/entities/book.entity';
import { Module as ModuleEntity } from './database/entities/module.entity';
import { University } from './database/entities/university.entity';
import { OTP } from './database/entities/otps.entity';
import { AuditLog } from './database/entities/audit_log.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        synchronize: false,
        logging: true,
        entities: [
          User,
          Listing,
          Book,
          ModuleEntity,
          University,
          OTP,
          AuditLog,
        ],
        migrations: ['dist/database/migrations/*.js'],
        migrationsRun: true,
      }),
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    AuthModule,
    ListingsModule,
    ModuleModule
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
