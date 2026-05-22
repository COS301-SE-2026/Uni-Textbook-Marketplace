import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ListingsController } from './listings.controller';
import { ListingsService } from './listings.service';

import { Listing } from '../database/entities/listing.entity';
import { User } from '../database/entities/users.entity';
import { Book } from '../database/entities/book.entity';
import { Module as ModuleEntity } from '../database/entities/module.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Listing, User, Book, ModuleEntity])],
  controllers: [ListingsController],
  providers: [ListingsService],
})
export class ListingsModule {}
