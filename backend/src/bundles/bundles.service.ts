import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ModuleBook } from '../database/entities/module-book.entity';
import { Listing, ListingStatus } from '../database/entities/listing.entity';

@Injectable()
export class BundlesService {
  constructor(
    @InjectRepository(ModuleBook)
    private readonly moduleBookRepository: Repository<ModuleBook>,

    @InjectRepository(Listing)
    private readonly listingRepository: Repository<Listing>,
  ) {}

  async optimizeBundle(moduleIds: string[]) {
    if (moduleIds.length === 0) {
      throw new Error('At least one module must be selected');
    }

    const moduleBooks = await this.moduleBookRepository.find({
      where: moduleIds.map((moduleId) => ({
        module: {
          id: moduleId,
        },
      })),
      relations: ['book', 'module'],
    });

    const requiredBooks = new Map<string, ModuleBook>();

    for (const moduleBook of moduleBooks) {
      requiredBooks.set(moduleBook.book.id, moduleBook);
    }

    const requiredBookIds = [...requiredBooks.keys()];

    const approvedListings = await this.listingRepository.find({
      where: requiredBookIds.map((bookId) => ({
        book: {
          id: bookId,
        },
        status: ListingStatus.APPROVED,
      })),
      relations: ['book', 'seller'],
    });

    return {
      requiredBooks: [...requiredBooks.values()],
      approvedListings,
    };
  }

  private groupListingsBySeller(listings: Listing[]): Map<string, Listing[]> {
    const listingsBySeller = new Map<string, Listing[]>();

    for (const listing of listings) {
      const sellerId = listing.seller.id;

      if (!listingsBySeller.has(sellerId)) {
        listingsBySeller.set(sellerId, []);
      }

      listingsBySeller.get(sellerId)!.push(listing);
    }

    return listingsBySeller;
  }

  private findOptimizedBundle(
    requiredBookIds: string[],
    listingsBySeller: Map<string, Listing[]>,
  ) {
    const uncoveredBookIds = new Set(requiredBookIds);
    const selectedListings: Listing[] = [];
    const selectedSellerIds: string[] = [];

    while (uncoveredBookIds.size > 0) {
      let bestSellerId: string | null = null;
      let bestListings: Listing[] = [];
      let bestScore = 0;

      for (const [sellerId, listings] of listingsBySeller.entries()) {
        const usefulListings = listings.filter((listing) =>
          uncoveredBookIds.has(listing.book.id),
        );

        if (usefulListings.length === 0) {
          continue;
        }

        const totalPrice = usefulListings.reduce(
          (total, listing) => total + Number(listing.price),
          0,
        );

        const score = usefulListings.length / totalPrice;

        if (score > bestScore) {
          bestScore = score;
          bestSellerId = sellerId;
          bestListings = usefulListings;
        }
      }

      if (!bestSellerId) {
        break;
      }

      selectedSellerIds.push(bestSellerId);
      selectedListings.push(...bestListings);

      for (const listing of bestListings) {
        uncoveredBookIds.delete(listing.book.id);
      }
    }

    const totalPrice = selectedListings.reduce(
      (total, listing) => total + Number(listing.price),
      0,
    );

    return {
      listings: selectedListings,
      sellerIds: selectedSellerIds,
      totalPrice,
      booksCovered: requiredBookIds.length - uncoveredBookIds.size,
    };
  }
}
