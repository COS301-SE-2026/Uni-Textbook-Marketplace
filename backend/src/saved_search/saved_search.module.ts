import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SavedSearchesController } from './saved_search.controller';
import { SavedSearchesService } from './saved_search.service';
import { ListingsModule } from '../listings/listings.module';
import { SavedSearch } from '../database/entities/saved_search.entity';
import { User } from '../database/entities/users.entity';
import { Listing } from '../database/entities/listing.entity';
import { Book } from '../database/entities/book.entity';
import { Module as ModuleEntity } from '../database/entities/module.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SavedSearch, User, Listing, Book, ModuleEntity]),
    forwardRef(() => ListingsModule),
  ],
  controllers: [SavedSearchesController],
  providers: [SavedSearchesService],
  exports: [SavedSearchesService],
})
export class SavedSearchesModule {}
