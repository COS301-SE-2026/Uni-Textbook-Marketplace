import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Listing, ListingStatus } from '../database/entities/listing.entity';
import { User } from '../database/entities/users.entity';
import { Book } from '../database/entities/book.entity';
import { Module as ModuleEntity } from '../database/entities/module.entity';

import { CreateListingDto } from './dto/create-listing.dto';
import { ListingFiltersDto } from './dto/listingFilter.dto';
import { SavedSearchesService } from '../saved_search/saved_search.service';

@Injectable()
export class ListingsService {
  [x: string]: any;
  constructor(
    @InjectRepository(Listing)
    private listingRepo: Repository<Listing>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Book)
    private bookRepo: Repository<Book>,

    @InjectRepository(ModuleEntity)
    private moduleRepo: Repository<ModuleEntity>,

    @Inject(forwardRef(() => SavedSearchesService))
    private savedSearchesService: SavedSearchesService,
  ) {}

  //Create
  async createListing(userId: string, dto: CreateListingDto) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');

    const book = await this.bookRepo.findOneBy({ id: dto.bookId });
    if (!book) throw new NotFoundException('Book not found');

    const module = dto.moduleId
      ? await this.moduleRepo.findOneBy({ id: dto.moduleId })
      : null;

    const listing = this.listingRepo.create({
      title: dto.title,
      seller: user,
      book,
      module: module,
      condition: dto.condition,
      annotation_level: dto.annotationLevel,
      price: dto.price,
      status: ListingStatus.PENDING,
      photo_urls: dto.photoUrls ?? [],
      has_notes: dto.hasNotes,
      description: dto.description,
    } as any);

    const savedListing = await this.listingRepo.save(listing);

    this.checkSavedSearchMatches(savedListing.id).catch((error) => {
      console.error('Error checking saved search matches:', error);
    });

    return savedListing;
  }

  private async checkSavedSearchMatches(listingId: string): Promise<void> {
    try {
      const matches =
        await this.savedSearchesService.findMatchingSavedSearches(listingId);

      if (matches.length === 0) {
        console.log(`No saved search matches found for listing ${listingId}`);

        return;
      }
      console.log(
        `Found ${matches.length} saved search matches for listing ${listingId}`,
      );

      for (const match of matches) {
        console.log(
          `User ${match.userId} has a saved search match for listing ${listingId}`,
        );

        // i'll uncomment this when the notification service is ready:

        // await this.notificationService.createNotification({

        //   userId: match.userId,

        //   type: 'NEW_MATCH',

        //   listingId: listingId,

        //   message: `New listing matches your saved search`,

        // });
      }
    } catch (error) {
      console.error(
        `Error checking saved search matches for listing ${listingId}:`,
        error,
      );
    }
  }

  //get the validated ones
  async getAllApproved(query?: ListingFiltersDto) {
    const qb = this.listingRepo
      .createQueryBuilder('listing')
      .leftJoinAndSelect('listing.book', 'book')
      .leftJoinAndSelect('listing.module', 'module')
      .leftJoinAndSelect('listing.seller', 'seller')
      .where('listing.status = :status', { status: ListingStatus.APPROVED });

    if (query?.search) {
      const itemSearched = `%${query.search}%`;

      qb.andWhere(
        `(
          listing.title ILIKE :itemSearched OR
          book.title ILIKE :itemSearched OR
          book.author ILIKE :itemSearched OR
          book.isbn ILIKE :itemSearched OR
          module.code ILIKE :itemSearched
          )`,

        { itemSearched },
      );
    }
    //optional query filters
    if (query?.moduleCode) {
      qb.andWhere('module.code ILIKE :moduleCode', {
        moduleCode: `%${query.moduleCode}%`,
      });
    }
    if (query?.faculty) {
      qb.andWhere('module.faculty ILIKE :faculty', {
        faculty: `%${query.faculty}%`,
      });
    }
    if (query?.condition) {
      qb.andWhere('listing.condition = :condition', {
        condition: query.condition,
      });
    }
    if (query?.annotationLevel) {
      qb.andWhere('listing.annotation_level = :annotationLevel', {
        annotationLevel: query.annotationLevel,
      });
    }
    if (query?.priceMin) {
      qb.andWhere('listing.price >= :priceMin', {
        priceMin: query.priceMin,
      });
    }
    if (query?.priceMax) {
      qb.andWhere('listing.price <= :priceMax', {
        priceMax: query.priceMax,
      });
    }
    if (query?.edition) {
      qb.andWhere('book.edition = :edition', {
        edition: query.edition,
      });
    }
    const [listings, total] = await qb.getManyAndCount();
    return [listings, total];
  }
  //get listings specific to the user
  async getMyListings(userId: string) {
    return this.listingRepo.find({
      where: {
        seller: { id: userId },
      },
      relations: ['book', 'module', 'seller', 'seller.university'],
    });
  }

  //similar to getMy, just specifies seller
  async getListingById(id: string) {
    if (!this.isValidUUID(id)) {
      throw new BadRequestException('Invalid listing ID format');
    }

    const listing = await this.listingRepo.findOne({
      where: { id },
      relations: ['book', 'module', 'seller', 'seller.university'],
    });

    if (!listing) throw new NotFoundException('Listing not found');

    return listing;
  }

  //awaiting approval
  async getPendingListings() {
    return this.listingRepo.find({
      where: { status: ListingStatus.PENDING },
      relations: ['book', 'seller'],
    });
  }

  //ensure admin only access
  async approveListing(id: string, adminId: string) {
    const listing = await this.getListingById(id);

    if (!listing) {
      throw new NotFoundException(`Listing with ID ${id} not found`);
    }

    listing.status = ListingStatus.APPROVED;
    listing.reviewer = { id: adminId } as User;
    listing.reviewed_at = new Date();

    return this.listingRepo.save(listing);
  }

  ///enrurer admin only access
  async rejectListing(id: string, adminId: string) {
    const listing = await this.getListingById(id);

    listing.status = ListingStatus.REJECTED;
    listing.reviewer = { id: adminId } as User;
    listing.reviewed_at = new Date();

    return this.listingRepo.save(listing);
  }

  private isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  async editlisting(dto: EditListingDto) {
    const listing = await this.listingRepo.findOne({
      where: { id: dto.id },
    });

    if (!listing) throw new NotFoundException('listing not found');

    Object.assign(listing, dto);

    return await this.listingRepo.save(listing);
  }

  async getAllListingsForAdmin(){
    return this.listingRepo.find({
      relations:['book','module','seller','reviewer'],
      order: { created_at: 'DESC'},
    });
  }
}
