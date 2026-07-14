import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';

import { Listing } from '../database/entities/listing.entity';
import { User } from '../database/entities/users.entity';
import { Wishlist } from '../database/entities/wishlist.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Listing, User, Wishlist])],
  controllers: [WishlistController],
  providers: [WishlistService],
})
export class WishlistModule {}
