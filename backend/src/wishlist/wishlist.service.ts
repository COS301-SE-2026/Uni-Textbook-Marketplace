import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Wishlist } from '../database/entities/wishlist.entity';
import { Listing } from '../database/entities/listing.entity';
import { User } from '../database/entities/users.entity';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,

    @InjectRepository(Listing)
    private readonly listingRepository: Repository<Listing>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async save(userId: string, listingId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');

    const listing = await this.listingRepository.findOne({
      where: { id: listingId },
    });
    if (!listing) throw new NotFoundException('listing not found');

    const existing = await this.wishlistRepository.findOne({
      where: {
        user_id: userId,
        listings_id: listingId,
      },
    });

    if (existing) return existing;

    const savelist = this.wishlistRepository.create({
      user_id: userId,
      listings_id: listingId,
    });

    return this.wishlistRepository.save(savelist);
  }

  async remove(userId: string, listingId: string) {
    const result = await this.wishlistRepository.delete({
      user_id: userId,
      listings_id: listingId,
    });

    return result;
  }

  async mylist(userId: string) {
    return this.wishlistRepository.findBy({
      user_id: userId,
    });
  }

  async mywishlist(userId: string) {
    const wishlistIteams = await this.wishlistRepository.find({
      where: { user_id: userId },
      relations: ['listing', 'listing.book', 'listing.module'],
      order: { created_at: 'DESC' },
    });

    return wishlistIteams.map((item) => item.listing);
  }
}
