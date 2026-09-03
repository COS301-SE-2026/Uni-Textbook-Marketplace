import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EditEvent } from './events/edit.event';

import {
  Listing,
  ListingStatus,
  ListingsStatus,
} from '../database/entities/listing.entity';
import { User } from '../database/entities/users.entity';
import { Book } from '../database/entities/book.entity';
import { Module as ModuleEntity } from '../database/entities/module.entity';
import { CreateListingDto } from './dto/create-listing.dto';
import { ListingFiltersDto } from './dto/listingFilter.dto';
import { EditListingDto } from './dto/editListing.dtos';

const LISTING_STATUS_TRANSITIONS: Record<ListingsStatus, ListingsStatus[]> = {
  [ListingsStatus.AVAILABLE]: [
    ListingsStatus.RESERVED,
    ListingsStatus.SOLD,
    ListingsStatus.WITHDRAWN,
  ],
  [ListingsStatus.RESERVED]: [
    ListingsStatus.AVAILABLE, // un-reserve, e.g. a deal falls through
    ListingsStatus.SOLD,
    ListingsStatus.WITHDRAWN,
  ],
  [ListingsStatus.SOLD]: [],
  [ListingsStatus.WITHDRAWN]: [],
};
@Injectable()
export class ListingsService {
  constructor(
    @InjectRepository(Listing)
    private readonly listingRepo: Repository<Listing>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Book)
    private readonly bookRepo: Repository<Book>,

    @InjectRepository(ModuleEntity)
    private readonly moduleRepo: Repository<ModuleEntity>,

    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createListing(userId: string, dto: CreateListingDto) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');

    const book = await this.bookRepo.findOneBy({ id: dto.bookId });
    if (!book) throw new NotFoundException('Book not found');

    const module = dto.moduleId
      ? await this.moduleRepo.findOneBy({ id: dto.moduleId })
      : null;

    const listingData = {
      title: dto.title,
      seller: user,
      book: book,
      module: module ?? null,
      condition: dto.condition,
      annotation_level: dto.annotationLevel,
      price: dto.price,
      status: ListingStatus.PENDING as ListingStatus,
      photo_urls: dto.photoUrls ?? [],
      has_notes: dto.hasNotes ?? false,
      description: dto.description,
    };

    const listing = this.listingRepo.create(
      listingData as DeepPartial<Listing>,
    );

    const savedListing = await this.listingRepo.save(listing);

    return savedListing;
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
      qb.leftJoin('module.faculty', 'faculty').andWhere(
        'faculty.name ILIKE :faculty',
        { faculty: `%${query.faculty}%` },
      );
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
      relations: [
        'book',
        'module',
        'module.faculty',
        'seller',
        'seller.university',
      ],
    });
  }

  //similar to getMy, just specifies seller
  async getListingById(id: string) {
    if (!this.isValidUUID(id)) {
      throw new BadRequestException('Invalid listing ID format');
    }

    const listing = await this.listingRepo.findOne({
      where: { id },
      relations: [
        'book',
        'module',
        'module.faculty',
        'seller',
        'seller.university',
      ],
    });

    if (!listing) throw new NotFoundException('Listing not found');

    return listing;
  }

  private isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  private createRejectedListingChanges(
    dto: EditListingDto,
    listing: Listing,
  ): string[] {
    const changes: string[] = [];
    const updates = [
      {
        shouldAdd: !!dto.title && dto.title !== listing.title,
        message: `Title: "${listing.title}" : "${dto.title}"`,
      },
      {
        shouldAdd: !!dto.price && dto.price !== listing.price,
        message: `Price: ${listing.price} : ${dto.price}`,
      },
      {
        shouldAdd: !!dto.condition && dto.condition !== listing.condition,
        message: `Condition: ${listing.condition} : ${dto.condition}`,
      },
      {
        shouldAdd: !!dto.description && dto.description !== listing.description,
        message: 'Description updated',
      },
      {
        shouldAdd: !!dto.photo_urls && dto.photo_urls !== listing.photo_urls,
        message: 'Photos updated',
      },
    ];

    for (const update of updates) {
      if (update.shouldAdd) {
        changes.push(update.message);
      }
    }

    return changes;
  }

  async editlisting(dto: EditListingDto) {
    const listing = await this.listingRepo.findOne({
      where: { id: dto.id },
      relations: ['reviewer', 'seller', 'book', 'module'],
    });

    if (!listing) throw new NotFoundException('listing not found');

    if (!this.isValidUUID(listing.id)) {
      throw new BadRequestException('Invalid listing ID format');
    }

    if (listing.status === ListingStatus.REJECTED) {
      const event = new EditEvent();

      event.adminId = listing.reviewer.id;
      event.entityType = 'Edited listing';
      event.listingId = listing.id;
      event.studentId = listing.seller.id;

      const changes = this.createRejectedListingChanges(dto, listing);

      event.message = `Listing has been edited. Changes: ${changes.join('; ')}`;
      listing.status = ListingStatus.PENDING;
      this.eventEmitter.emit('listing.edit', event);
    }

    Object.assign(listing, dto);

    return await this.listingRepo.save(listing);
  }

  async updateListingStatus(
    userId: string,
    listingId: string,
    newStatus: ListingsStatus,
  ) {
    if (!this.isValidUUID(listingId)) {
      throw new BadRequestException('Invalid listing ID format');
    }

    const listing = await this.listingRepo.findOne({
      where: { id: listingId },
      relations: ['seller'],
    });

    if (!listing) throw new NotFoundException('Listing not found');

    if (listing.seller.id !== userId) {
      throw new ForbiddenException(
        'Only the listing owner can update its sale status',
      );
    }

    if (listing.status !== ListingStatus.APPROVED) {
      throw new BadRequestException(
        'Only approved listings can have their sale status changed',
      );
    }

    if (listing.listing_status === newStatus) {
      throw new BadRequestException(`Listing is already ${newStatus}`);
    }

    const allowedNext =
      LISTING_STATUS_TRANSITIONS[listing.listing_status] ?? [];
    if (!allowedNext.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot change status from ${listing.listing_status} to ${newStatus}`,
      );
    }

    listing.listing_status = newStatus;
    return await this.listingRepo.save(listing);
  }

  async getAllListingsForAdmin() {
    return this.listingRepo.find({
      relations: ['book', 'module', 'seller', 'reviewer'],
      order: { created_at: 'DESC' },
    });
  }
}
