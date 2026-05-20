import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Listing, ListingStatus } from '../database/entities/listing.entity';
import { User } from '../database/entities/users.entity';
import { Book } from '../database/entities/book.entity';
import { Module as ModuleEntity } from '../database/entities/module.entity';

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

    // UC1 - CREATE LISTING
    async createListing(userId: string, dto: any) {
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

    // UC2 - APPROVED ONLY
    async getAllApproved() {
        return this.listingRepo.find({
        where: { status: ListingStatus.APPROVED },
        relations: ['book', 'module', 'seller'],
        });
    }

    // UC2 - MY LISTINGS
    async getMyListings(userId: string) {
        return this.listingRepo.find({
        where: {
            seller: { id: userId },
        },
        relations: ['book', 'module'],
        });
    }

    // UC2 - BY ID
    async getListingById(id: string) {
        const listing = await this.listingRepo.findOne({
        where: { id },
        relations: ['book', 'module', 'seller'],
        });

        if (!listing) throw new NotFoundException('Listing not found');

        return listing;
    }

    // UC3 - ADMIN PENDING
    async getPendingListings() {
        return this.listingRepo.find({
        where: { status: ListingStatus.PENDING },
        relations: ['book', 'seller'],
        });
    }

    // UC3 - APPROVE
    async approveListing(id: string, adminId: string) {
        const listing = await this.getListingById(id);

        listing.status = ListingStatus.APPROVED;
        listing.reviewer = { id: adminId } as User;
        listing.reviewed_at = new Date();

        return this.listingRepo.save(listing);
    }

    // UC3 - REJECT
    async rejectListing(id: string, adminId: string) {
        const listing = await this.getListingById(id);

        listing.status = ListingStatus.REJECTED;
        listing.reviewer = { id: adminId } as User;
        listing.reviewed_at = new Date();

        return this.listingRepo.save(listing);
    }
}