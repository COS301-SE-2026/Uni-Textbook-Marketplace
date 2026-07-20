import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ListingsController } from './listings.controller';
import { ListingsService } from './listings.service';
import { AdminService } from '../admin/admin.service';
import { Listing } from '../database/entities/listing.entity';
import { User } from '../database/entities/users.entity';
import { Book } from '../database/entities/book.entity';
import { Module as ModuleEntity } from '../database/entities/module.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Listing, User, Book, ModuleEntity])],
  controllers: [ListingsController],
  providers: [ListingsService, AdminService, RolesGuard, JwtAuthGuard],
})
export class ListingsModule {}
