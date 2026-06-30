import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditService } from '../audit/audit.service';
import { AuditLog } from '../database/entities/audit_log.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog]), 
  ],
  controllers: [AdminController],
  providers: [AdminService, AuditService], 
  exports: [AuditService], 
})
export class AdminModule {}