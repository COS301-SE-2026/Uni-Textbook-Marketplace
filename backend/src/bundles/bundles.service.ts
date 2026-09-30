import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

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
    const uniqueModuleIds = [...new Set(moduleIds ?? [])];

    if (uniqueModuleIds.length === 0) {
      throw new BadRequestException('At least one module must be selected');
    }

    const moduleBooks = await this.moduleBookRepository.find({
      where: { module: { id: In(uniqueModuleIds) } },
      relations: ['book', 'module'],
    });

    const requiredBooks = new Map<string, ModuleBook>();

    for (const moduleBook of moduleBooks) {
      requiredBooks.set(moduleBook.book.id, moduleBook);
    }

    const requiredBookIds = [...requiredBooks.keys()];

    // An empty In([]) or where: [] can match everything, so never query
    // listings when there is nothing required.
    if (requiredBookIds.length === 0) {
      return this.emptyResult();
    }

    const approvedListings = await this.listingRepository.find({
      where: {
        book: { id: In(requiredBookIds) },
        status: ListingStatus.APPROVED,
      },
      relations: ['book', 'seller'],
    });

    const listingsBySeller = this.groupListingsBySeller(approvedListings);

    const optimizedBundle = this.findOptimizedBundle(
      requiredBookIds,
      listingsBySeller,
    );

    const cheapestIndividualOption = this.findCheapestIndividualOption(
      requiredBookIds,
      approvedListings,
    );

    return {
      requiredBooks: [...requiredBooks.values()].map((mb) => ({
        id: mb.book.id,
        title: mb.book.title,
        author: mb.book.author,
        edition: mb.book.edition,
        isbn: mb.book.isbn,
        moduleId: mb.module?.id,
      })),
      approvedListings: approvedListings.map((l) => this.toPublicListing(l)),
      optimizedBundle: this.toPublicBundle(optimizedBundle),
      cheapestIndividualOption: this.toPublicBundle(cheapestIndividualOption),
    };
  }

  private emptyResult() {
    const emptyBundle = {
      listings: [],
      sellerIds: [] as string[],
      totalPrice: 0,
      booksCovered: 0,
    };

    return {
      requiredBooks: [],
      approvedListings: [],
      optimizedBundle: { ...emptyBundle },
      cheapestIndividualOption: { ...emptyBundle },
    };
  }

  // Only expose what the results page needs. Never return raw seller
  // entities (email, ban fields, etc.).
  private toPublicListing(listing: Listing) {
    const lastInitial = listing.seller.last_name?.charAt(0) ?? '';

    return {
      id: listing.id,
      title: listing.title,
      price: Number(listing.price),
      condition: listing.condition,
      book: {
        id: listing.book.id,
        title: listing.book.title,
        author: listing.book.author,
        edition: listing.book.edition,
        isbn: listing.book.isbn,
      },
      seller: {
        id: listing.seller.id,
        name: `${listing.seller.first_name} ${lastInitial}.`.trim(),
      },
    };
  }

  private toPublicBundle(bundle: {
    listings: Listing[];
    sellerIds: string[];
    totalPrice: number;
    booksCovered: number;
  }) {
    return {
      listings: bundle.listings.map((l) => this.toPublicListing(l)),
      sellerIds: bundle.sellerIds,
      totalPrice: bundle.totalPrice,
      booksCovered: bundle.booksCovered,
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

  private getCheapestListingsPerBook(listings: Listing[]): Listing[] {
    const cheapestListings = new Map<string, Listing>();

    for (const listing of listings) {
      const bookId = listing.book.id;
      const currentCheapest = cheapestListings.get(bookId);

      if (
        !currentCheapest ||
        Number(listing.price) < Number(currentCheapest.price)
      ) {
        cheapestListings.set(bookId, listing);
      }
    }

    return [...cheapestListings.values()];
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
        const cheapestListings = this.getCheapestListingsPerBook(listings);

        const usefulListings = cheapestListings.filter((listing) =>
          uncoveredBookIds.has(listing.book.id),
        );

        if (usefulListings.length === 0) {
          continue;
        }

        const totalPrice = usefulListings.reduce(
          (total, listing) => total + Number(listing.price),
          0,
        );

        const score = usefulListings.length / Math.max(totalPrice, 1);

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

  private findCheapestIndividualOption(
    requiredBookIds: string[],
    listings: Listing[],
  ) {
    const selectedListings: Listing[] = [];

    for (const bookId of requiredBookIds) {
      const bookListings = listings.filter(
        (listing) => listing.book.id === bookId,
      );

      if (bookListings.length === 0) {
        continue;
      }

      const cheapestListing = bookListings.reduce(
        (cheapest, listing) =>
          Number(listing.price) < Number(cheapest.price) ? listing : cheapest,
        bookListings[0],
      );

      selectedListings.push(cheapestListing);
    }

    const sellerIds = [
      ...new Set(selectedListings.map((listing) => listing.seller.id)),
    ];

    const totalPrice = selectedListings.reduce(
      (total, listing) => total + Number(listing.price),
      0,
    );

    return {
      listings: selectedListings,
      sellerIds,
      totalPrice,
      booksCovered: selectedListings.length,
    };
  }
}
