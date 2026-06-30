import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { User } from '../database/entities/users.entity';
import { Listing, ListingStatus } from '../database/entities/listing.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
  ) {}

  async approveListing(id: string, admin: User) {
    return await this.entityManager.transaction(async (manager) => {
      const listingRepository = manager.getRepository(Listing);

      const listing = await listingRepository.findOne({
        where: { id },
      });

      if (!listing) {
        throw new NotFoundException(`Listing with ID ${id} not found`);
      }

      // Update listing status
      listing.status = ListingStatus.APPROVED;
      listing.reviewer = admin;
      listing.reviewed_at = new Date();

      await listingRepository.save(listing);

      return listing;
    });
  }

  async rejectListing(id: string, admin: User, _reason?: string) {
    return await this.entityManager.transaction(async (manager) => {
      const listingRepository = manager.getRepository(Listing);

      const listing = await listingRepository.findOne({
        where: { id },
      });

      if (!listing) {
        throw new NotFoundException(`Listing with ID ${id} not found`);
      }

      // Update listing status
      listing.status = ListingStatus.REJECTED;
      listing.reviewer = admin;
      listing.reviewed_at = new Date();

      await listingRepository.save(listing);

      return listing;
    });
  }

  async getPendingListings() {
    const listingRepository = this.entityManager.getRepository(Listing);

    return await listingRepository.find({
      where: { status: ListingStatus.PENDING },
      relations: ['seller', 'book', 'module'],
      order: { created_at: 'ASC' },
    });
  }

  async getListingById(id: string) {
    const listingRepository = this.entityManager.getRepository(Listing);

    const listing = await listingRepository.findOne({
      where: { id },
      relations: ['seller', 'book', 'module', 'reviewer'],
    });

    if (!listing) {
      throw new NotFoundException(`Listing with ID ${id} not found`);
    }

    return listing;
  }

  async getListingsByStatus(status: ListingStatus) {
    const listingRepository = this.entityManager.getRepository(Listing);

    return await listingRepository.find({
      where: { status },
      relations: ['seller', 'book', 'module'],
      order: { created_at: 'DESC' },
    });
  }
}