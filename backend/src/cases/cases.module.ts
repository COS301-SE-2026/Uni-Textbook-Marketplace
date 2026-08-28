import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CasesController } from './cases.controller';
import { CasesService } from './cases.service';
import { Case } from '../database/entities/case.entity';
import { User } from '../database/entities/users.entity';
import { AuditLog } from '../database/entities/audit_log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Case, User, AuditLog])],
  controllers: [CasesController],
  providers: [CasesService],
  exports: [CasesService],
})
export class CasesModule {}
