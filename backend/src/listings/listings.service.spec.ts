import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ListingsService } from './listings.service';

describe('ListingsService', () => {
  let service: ListingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ListingsService],
    }).compile();

    service = module.get<ListingsService>(ListingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createListing', () => {
    it('should create a new listing with PENDING status', () => {
      const result = service.createListing();
      
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('status', 'PENDING');
      expect(result).toHaveProperty('message', 'Listing submitted for review');
      expect(result.id).toBe('mock-uuid');
    });
  });

  describe('getAllListings', () => {
    it('should return all listings', () => {
      const listings = service.getAllListings();
      
      expect(listings).toBeInstanceOf(Array);
      expect(listings.length).toBe(4);
    });

    it('should return listings with correct structure', () => {
      const listings = service.getAllListings();
      const firstListing = listings[0];
      
      expect(firstListing).toHaveProperty('id');
      expect(firstListing).toHaveProperty('title');
      expect(firstListing).toHaveProperty('isbn');
      expect(firstListing).toHaveProperty('edition');
      expect(firstListing).toHaveProperty('condition');
      expect(firstListing).toHaveProperty('annotationLevel');
      expect(firstListing).toHaveProperty('moduleCode');
      expect(firstListing).toHaveProperty('price');
      expect(firstListing).toHaveProperty('status');
      expect(firstListing).toHaveProperty('sellerId');
    });
  });

  describe('getMyListings', () => {
    it('should return listings for user ID-1', () => {
      const myListings = service.getMyListings();
      
      expect(myListings).toBeInstanceOf(Array);
      expect(myListings.length).toBe(2); 
      expect(myListings.every(listing => listing.sellerId === 'ID-1')).toBe(true);
    });

    it('should return only listings belonging to ID-1', () => {
      const myListings = service.getMyListings();
      
      const sellerIds = myListings.map(listing => listing.sellerId);
      expect(sellerIds.every(id => id === 'ID-1')).toBe(true);
      expect(sellerIds).not.toContain('ID-2');
      expect(sellerIds).not.toContain('ID-3');
    });

    it('should return listings with various statuses', () => {
      const myListings = service.getMyListings();
      const statuses = myListings.map(listing => listing.status);
      
      expect(statuses).toContain('PENDING');
      expect(statuses).toContain('APPROVED');
      expect(statuses).not.toContain('REJECTED');
    });
  });

  describe('getListingById', () => {
    it('should return listing when valid ID is provided', () => {
      const listing = service.getListingById('1');
      
      expect(listing).toBeDefined();
      expect(listing.id).toBe('1');
      expect(listing.title).toBe('title1');
      expect(listing.sellerId).toBe('ID-1');
    });

    it('should return listing with ID "1a"', () => {
      const listing = service.getListingById('1a');
      
      expect(listing).toBeDefined();
      expect(listing.id).toBe('1a');
      expect(listing.status).toBe('APPROVED');
    });

    it('should return listing with ID "2"', () => {
      const listing = service.getListingById('2');
      
      expect(listing).toBeDefined();
      expect(listing.id).toBe('2');
      expect(listing.sellerId).toBe('ID-2');
      expect(listing.moduleCode).toBe('cos220');
    });

    it('should return listing with ID "3"', () => {
      const listing = service.getListingById('3');
      
      expect(listing).toBeDefined();
      expect(listing.id).toBe('3');
      expect(listing.status).toBe('REJECTED');
    });

    it('should throw NotFoundException when listing ID does not exist', () => {
      expect(() => service.getListingById('non-existent-id')).toThrow(NotFoundException);
      expect(() => service.getListingById('non-existent-id')).toThrow('Listing not found');
    });

    it('should throw NotFoundException for empty string ID', () => {
      expect(() => service.getListingById('')).toThrow(NotFoundException);
    });

    it('should throw NotFoundException for null or undefined', () => {
      expect(() => service.getListingById(null as any)).toThrow(NotFoundException);
      expect(() => service.getListingById(undefined as any)).toThrow(NotFoundException);
    });
  });


  describe('Edge cases and data integrity', () => {
    it('should return frozen/immutable objects', () => {
      const listings = service.getAllListings();
      
      
      if (Object.isFrozen(listings[0])) {
        expect(Object.isFrozen(listings[0])).toBe(true);
      }
    });

    it('should have consistent data structure across all listings', () => {
      const listings = service.getAllListings();
      
      listings.forEach(listing => {
        expect(listing).toHaveProperty('id');
        expect(listing).toHaveProperty('title');
        expect(listing).toHaveProperty('isbn');
        expect(listing).toHaveProperty('edition');
        expect(listing).toHaveProperty('condition');
        expect(listing).toHaveProperty('annotationLevel');
        expect(listing).toHaveProperty('moduleCode');
        expect(listing).toHaveProperty('price');
        expect(listing).toHaveProperty('status');
        expect(listing).toHaveProperty('sellerId');
      });
    });

    it('should have correct data types', () => {
      const listings = service.getAllListings();
      
      listings.forEach(listing => {
        expect(typeof listing.id).toBe('string');
        expect(typeof listing.title).toBe('string');
        expect(typeof listing.price).toBe('string');
        expect(typeof listing.sellerId).toBe('string');
        expect(['PENDING', 'APPROVED', 'REJECTED']).toContain(listing.status);
      });
    });
  });

  // Integration-style test
  describe('Service workflow', () => {
    it('should get listing by ID after retrieving all listings', () => {
      const allListings = service.getAllListings();
      const firstListingId = allListings[0].id;
      
      const fetchedListing = service.getListingById(firstListingId);
      
      expect(fetchedListing).toEqual(allListings[0]);
    });

    it('should filter my listings correctly from all listings', () => {
      const allListings = service.getAllListings();
      const myListings = service.getMyListings();
      
      const expectedMyListings = allListings.filter(
        listing => listing.sellerId === 'ID-1'
      );
      
      expect(myListings).toEqual(expectedMyListings);
    });
  });
});