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

    console.log('Required books:', requiredBookIds);
    console.log('Approved listings:', approvedListings);

    return {
      requiredBooks: [...requiredBooks.values()],
      approvedListings,
    };
  }
}
