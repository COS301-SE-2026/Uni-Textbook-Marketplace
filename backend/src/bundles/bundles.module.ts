import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BundlesService } from './bundles.service';
import { ModuleBook } from '../database/entities/module-book.entity';
import { Listing } from '../database/entities/listing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ModuleBook, Listing])],
  providers: [BundlesService],
  exports: [BundlesService],
})
export class BundlesModule {}
