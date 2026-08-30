import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../database/entities/audit_log.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../database/entities/users.entity';
import { ReportsModule } from '../reports/reports.module';
import { SavedSearchesModule } from '../saved_search/saved_search.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog, User]),
    ReportsModule,
    SavedSearchesModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
