import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Listing, ListingStatus } from '../database/entities/listing.entity';
import { User } from '../database/entities/users.entity';
import { Book } from '../database/entities/book.entity';
import { Module as ModuleEntity } from '../database/entities/module.entity';

import { CreateListingDto } from './dto/create-listing.dto';

@Injectable()
export class ListingsService {
  constructor(
    @InjectRepository(Listing)
    private listingRepo: Repository<Listing>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Book)
    private bookRepo: Repository<Book>,

    @InjectRepository(ModuleEntity)
    private moduleRepo: Repository<ModuleEntity>,
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
      module: module ?? undefined,
      condition: dto.condition,
      annotation_level: dto.annotationLevel,
      price: dto.price,
      status: ListingStatus.PENDING,
      photo_urls: dto.photoUrls ?? [],
      has_notes: dto.hasNotes ?? false,
    });

    return this.listingRepo.save(listing);
  }

  //get the validated ones
  async getAllApproved(query?: any) {
    const qb = this.listingRepo.createQueryBuilder('listing')
      .leftJoinAndSelect('listing.book', 'book')
      .leftJoinAndSelect('listing.module', 'module')
      .leftJoinAndSelect('listing.seller', 'seller')
      .where('listing.status = :status', { status: ListingStatus.APPROVED });
    //optional query fikters
    if (query?.moduleCode) {
      qb.andWhere('module.code = :moduleCode', {
        moduleCode: query.moduleCode,
      });
    }
    if (query?.faculty) {
      qb.andWhere('module.faculty = :faculty', {
        faculty: query.faculty,
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
    return qb.getMany();
  }
  //get listings specific to the user
  async getMyListings(userId: string) {
    return this.listingRepo.find({
      where: {
        seller: { id: userId },
      },
      relations: ['book', 'module'],
    });
  }

  //similar to getMy, just specifies seller
  async getListingById(id: string) {
    const listing = await this.listingRepo.findOne({
      where: { id },
      relations: ['book', 'module', 'seller'],
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
}
