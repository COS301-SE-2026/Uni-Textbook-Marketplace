import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { INestApplication } from '@nestjs/common';

import { TestModule } from './test.module';
import { SavedSearchesService } from '.././src/saved_search/saved_search.service';
import { ListingsService } from '.././src/listings/listings.service';
import { SavedSearch } from '.././src/database/entities/saved_search.entity';
import { User } from '.././src/database/entities/users.entity';
import { Listing, ListingStatus } from '.././src/database/entities/listing.entity';
import { Book } from '.././src/database/entities/book.entity';
import { Module as ModuleEntity } from '.././src/database/entities/module.entity';
import { Faculty } from '.././src/database/entities/faculty.entity';
import { University } from '.././src/database/entities/university.entity';
import { Notification } from '.././src/database/entities/notifications.entity';
import { SavedSearchFiltersDto } from '.././src/saved_search/dto/saved_search.dto';

describe('Saved Search Setup & Filter Matching', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let savedSearchService: SavedSearchesService;
  let savedSearchRepo: Repository<SavedSearch>;
  let userRepo: Repository<User>;
  let bookRepo: Repository<Book>;
  let moduleRepo: Repository<ModuleEntity>;


  let testUser1: User;
  let testUser2: User;
  let testBook: Book;
  let testModule: ModuleEntity;
  let testUniversity: University;
  let testFaculty: Faculty;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    dataSource = module.get(DataSource);
    savedSearchService = module.get(SavedSearchesService);
    savedSearchRepo = dataSource.getRepository(SavedSearch);
    userRepo = dataSource.getRepository(User);
    bookRepo = dataSource.getRepository(Book);
    moduleRepo = dataSource.getRepository(ModuleEntity);

    
    await setupTestData();
  });

  afterAll(async () => {
    await dataSource.dropDatabase();
    await app.close();
  });

  async function setupTestData() {
  
    testUniversity = await userRepo.save({
      id: 'univ-1',
      name: 'Test University',
      email_domain: 'test.edu',
    } as University);

    
    testFaculty = await userRepo.save({
      id: 'fac-1',
      name: 'Computer Science',
      university: testUniversity,
    } as Faculty);

    
    testModule = await moduleRepo.save({
      id: 'mod-1',
      code: 'CS101',
      name: 'Introduction to Computer Science',
      faculty: testFaculty,
      university: testUniversity,
      semester: 1,
    } as ModuleEntity);

    
    testBook = await bookRepo.save({
      id: 'book-1',
      isbn: '978-0132350884',
      title: 'Clean Code',
      author: 'Robert C. Martin',
      edition: 1,
      publisher: 'Prentice Hall',
    } as Book);

    
    testUser1 = await userRepo.save({
      id: 'user-1',
      email: 'user1@test.com',
      password_hash: 'hashed',
      first_name: 'Test',
      last_name: 'User1',
      is_verified: true,
      role: 'student',
      university: testUniversity,
      faculty: testFaculty,
    } as User);

    testUser2 = await userRepo.save({
      id: 'user-2',
      email: 'user2@test.com',
      password_hash: 'hashed',
      first_name: 'Test',
      last_name: 'User2',
      is_verified: true,
      role: 'student',
      university: testUniversity,
      faculty: testFaculty,
    } as User);
  }

  function createTestListing(overrides: Partial<Listing> = {}): Listing {
    return {
      id: 'listing-test-1',
      title: 'Clean Code Textbook',
      seller: testUser1,
      book: testBook,
      module: testModule,
      condition: 'good',
      annotation_level: 'light',
      price: 45.99,
      reviewer: null as any,
      reviewed_at: null as any,
      photo_urls: [],
      status: ListingStatus.APPROVED,
      listing_status: 'AVAILABLE' as any,
      has_notes: false,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null as any,
      description: 'Great condition textbook',
      reports: [],
      ...overrides,
    } as Listing;
  }

  describe('Basic Filter Matching', () => {
    it('should match when filter is empty', () => {
      const listing = createTestListing();
      const filter: SavedSearchFiltersDto = {};
      
      const result = savedSearchService.matchesFilter(listing, filter);
      expect(result).toBe(true);
    });

    it('should match when filter has only moduleCode', () => {
      const listing = createTestListing();
      const filter: SavedSearchFiltersDto = {
        moduleCode: 'CS101',
      };
      
      const result = savedSearchService.matchesFilter(listing, filter);
      expect(result).toBe(true);
    });

    it('should not match when moduleCode is wrong', () => {
      const listing = createTestListing();
      const filter: SavedSearchFiltersDto = {
        moduleCode: 'CS102',
      };
      
      const result = savedSearchService.matchesFilter(listing, filter);
      expect(result).toBe(false);
    });

    it('should match when filter has only condition', () => {
      const listing = createTestListing();
      const filter: SavedSearchFiltersDto = {
        condition: 'good',
      };
      
      const result = savedSearchService.matchesFilter(listing, filter);
      expect(result).toBe(true);
    });

    it('should not match when condition is wrong', () => {
      const listing = createTestListing();
      const filter: SavedSearchFiltersDto = {
        condition: 'new',
      };
      
      const result = savedSearchService.matchesFilter(listing, filter);
      expect(result).toBe(false);
    });

    it('should match when filter has only annotationLevel', () => {
      const listing = createTestListing();
      const filter: SavedSearchFiltersDto = {
        annotationLevel: 'light',
      };
      
      const result = savedSearchService.matchesFilter(listing, filter);
      expect(result).toBe(true);
    });

    it('should match with modules array containing listing module', () => {
      const listing = createTestListing();
      const filter: SavedSearchFiltersDto = {
        modules: ['CS101', 'CS102', 'CS103'],
      };
      
      const result = savedSearchService.matchesFilter(listing, filter);
      expect(result).toBe(true);
    });

    it('should not match when modules array does not contain listing module', () => {
      const listing = createTestListing();
      const filter: SavedSearchFiltersDto = {
        modules: ['CS102', 'CS103'],
      };
      
      const result = savedSearchService.matchesFilter(listing, filter);
      expect(result).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle listing with null module', () => {
      const listing = createTestListing({ module: null });
      const filter: SavedSearchFiltersDto = {
        moduleCode: 'CS101',
      };
      
      const result = savedSearchService.matchesFilter(listing, filter);
      expect(result).toBe(false);
    });

    it('should handle listing with null book', () => {
      const listing = createTestListing({ book: null as any });
      const filter: SavedSearchFiltersDto = {
        book_title: 'Clean Code',
      };
      
      const result = savedSearchService.matchesFilter(listing, filter);
      expect(result).toBe(false);
    });

    it('should handle listing with null price', () => {
      const listing = createTestListing({ price: null as any });
      const filter: SavedSearchFiltersDto = {
        priceMin: '10',
        priceMax: '50',
      };
      
      const result = savedSearchService.matchesFilter(listing, filter);
      expect(result).toBe(false);
    });

    it('should return true when filter has only undefined/null values', () => {
      const listing = createTestListing();
      const filter: SavedSearchFiltersDto = {
        moduleCode: undefined,
        priceMin: null as any,
        priceMax: null as any,
        condition: undefined,
      };
      
      const result = savedSearchService.matchesFilter(listing, filter);
      expect(result).toBe(true);
    });
  });
   describe('Price Range & Book Filters', () => {
    describe('Price Range Filters', () => {
      it('should match when price is between min and max', () => {
        const listing = createTestListing({ price: 45.99 });
        const filter: SavedSearchFiltersDto = {
          priceMin: '30',
          priceMax: '50',
        };
        
        const result = savedSearchService.matchesFilter(listing, filter);
        expect(result).toBe(true);
      });

      it('should match when price is exactly at min', () => {
        const listing = createTestListing({ price: 30 });
        const filter: SavedSearchFiltersDto = {
          priceMin: '30',
          priceMax: '50',
        };
        
        const result = savedSearchService.matchesFilter(listing, filter);
        expect(result).toBe(true);
      });

      it('should match when price is exactly at max', () => {
        const listing = createTestListing({ price: 50 });
        const filter: SavedSearchFiltersDto = {
          priceMin: '30',
          priceMax: '50',
        };
        
        const result = savedSearchService.matchesFilter(listing, filter);
        expect(result).toBe(true);
      });

      it('should reject when price is below min', () => {
        const listing = createTestListing({ price: 25 });
        const filter: SavedSearchFiltersDto = {
          priceMin: '30',
          priceMax: '50',
        };
        
        const result = savedSearchService.matchesFilter(listing, filter);
        expect(result).toBe(false);
      });

      it('should reject when price is above max', () => {
        const listing = createTestListing({ price: 60 });
        const filter: SavedSearchFiltersDto = {
          priceMin: '30',
          priceMax: '50',
        };
        
        const result = savedSearchService.matchesFilter(listing, filter);
        expect(result).toBe(false);
      });

      it('should match when only min is specified', () => {
        const listing = createTestListing({ price: 45 });
        const filter: SavedSearchFiltersDto = {
          priceMin: '40',
        };
        
        const result = savedSearchService.matchesFilter(listing, filter);
        expect(result).toBe(true);
      });

      it('should match when only max is specified', () => {
        const listing = createTestListing({ price: 35 });
        const filter: SavedSearchFiltersDto = {
          priceMax: '50',
        };
        
        const result = savedSearchService.matchesFilter(listing, filter);
        expect(result).toBe(true);
      });

      it('should handle priceMin as number', () => {
        const listing = createTestListing({ price: 45 });
        const filter: SavedSearchFiltersDto = {
          priceMin: 30 as any,
          priceMax: 50 as any,
        };
        
        const result = savedSearchService.matchesFilter(listing, filter);
        expect(result).toBe(true);
      });

      it('should handle price with decimal values', () => {
        const listing = createTestListing({ price: 45.99 });
        const filter: SavedSearchFiltersDto = {
          priceMin: '45.50',
          priceMax: '46.00',
        };
        
        const result = savedSearchService.matchesFilter(listing, filter);
        expect(result).toBe(true);
      });

      it('should handle empty string price values', () => {
        const listing = createTestListing({ price: 45 });
        const filter: SavedSearchFiltersDto = {
          priceMin: '',
          priceMax: '',
        };
        
        const result = savedSearchService.matchesFilter(listing, filter);
        expect(result).toBe(true);
      });
    });

    describe('Book Filters', () => {
      it('should match by exact book title', () => {
        const listing = createTestListing();
        const filter: SavedSearchFiltersDto = {
          book_title: 'Clean Code',
        };
        
        const result = savedSearchService.matchesFilter(listing, filter);
        expect(result).toBe(true);
      });

      it('should match by partial book title', () => {
        const listing = createTestListing();
        const filter: SavedSearchFiltersDto = {
          book_title: 'Clean',
        };
        
        const result = savedSearchService.matchesFilter(listing, filter);
        expect(result).toBe(true);
      });

      it('should not match by wrong book title', () => {
        const listing = createTestListing();
        const filter: SavedSearchFiltersDto = {
          book_title: 'Wrong Title',
        };
        
        const result = savedSearchService.matchesFilter(listing, filter);
        expect(result).toBe(false);
      });

      it('should match by exact author', () => {
        const listing = createTestListing();
        const filter: SavedSearchFiltersDto = {
          author: 'Robert C. Martin',
        };
        
        const result = savedSearchService.matchesFilter(listing, filter);
        expect(result).toBe(true);
      });

      it('should match by partial author name', () => {
        const listing = createTestListing();
        const filter: SavedSearchFiltersDto = {
          author: 'Martin',
        };
        
        const result = savedSearchService.matchesFilter(listing, filter);
        expect(result).toBe(true);
      });

      it('should match by exact ISBN', () => {
        const listing = createTestListing();
        const filter: SavedSearchFiltersDto = {
          isbn: '978-0132350884',
        };
        
        const result = savedSearchService.matchesFilter(listing, filter);
        expect(result).toBe(true);
      });

      it('should match by ISBN case-insensitively', () => {
        const listing = createTestListing();
        const filter: SavedSearchFiltersDto = {
          isbn: '978-0132350884'.toLowerCase(),
        };
        
        const result = savedSearchService.matchesFilter(listing, filter);
        expect(result).toBe(true);
      });

      it('should not match by wrong ISBN', () => {
        const listing = createTestListing();
        const filter: SavedSearchFiltersDto = {
          isbn: '978-0132350885',
        };
        
        const result = savedSearchService.matchesFilter(listing, filter);
        expect(result).toBe(false);
      });

      it('should match by edition', () => {
        const listing = createTestListing();
        const filter: SavedSearchFiltersDto = {
          edition: '1',
        };
        
        const result = savedSearchService.matchesFilter(listing, filter);
        expect(result).toBe(true);
      });

      it('should not match by wrong edition', () => {
        const listing = createTestListing();
        const filter: SavedSearchFiltersDto = {
          edition: '2',
        };
        
        const result = savedSearchService.matchesFilter(listing, filter);
        expect(result).toBe(false);
      });
    });
  });
  describe('Search, Faculty & Combined Filters', () => {
    describe('Search Filter', () => {
      it('should match by listing title', () => {
        const listing = createTestListing();
        const filter: SavedSearchFiltersDto = {
          search: 'Clean Code Textbook',
        };
        
        const result = savedSearchService.matchesFilter(listing, filter);
        expect(result).toBe(true);
      });

      it('should match by partial listing title', () => {
        const listing = createTestListing();
        const filter: SavedSearchFiltersDto = {
          search: 'Clean',
        };
        
        const result = savedSearchService.matchesFilter(listing, filter);
        expect(result).toBe(true);
      });

      it('should match by book title via search', () => {
        const listing = createTestListing();
        const filter: SavedSearchFiltersDto = {
          search: 'Clean Code',
        };
        
        const result = savedSearchService.matchesFilter(listing, filter);
        expect(result).toBe(true);
      });

      it('should match by author via search', () => {
        const listing = createTestListing();
        const filter: SavedSearchFiltersDto = {
          search: 'Robert C. Martin',
        };
        
        const result = savedSearchService.matchesFilter(listing, filter);
        expect(result).toBe(true);
      });

      it('should match by ISBN via search', () => {
        const listing = createTestListing();
        const filter: SavedSearchFiltersDto = {
          search: '978-0132350884',
        };
        
        const result = savedSearchService.matchesFilter(listing, filter);
        expect(result).toBe(true);
      });

      it('should match by module code via search', () => {
        const listing = createTestListing();
        const filter: SavedSearchFiltersDto = {
          search: 'CS101',
        };
        
        const result = savedSearchService.matchesFilter(listing, filter);
        expect(result).toBe(true);
      });

      it('should match by module name via search', () => {
        const listing = createTestListing();
        const filter: SavedSearchFiltersDto = {
          search: 'Introduction to Computer Science',
        };
        
        const result = savedSearchService.matchesFilter(listing, filter);
        expect(result).toBe(true);
      });

      it('should not match when search term not found', () => {
        const listing = createTestListing();
        const filter: SavedSearchFiltersDto = {
          search: 'NonExistentTerm',
        };
        
        const result = savedSearchService.matchesFilter(listing, filter);
        expect(result).toBe(false);
      });
    });

    describe('Faculty and University Filters', () => {
      it('should match by faculty name', () => {
        const listing = createTestListing();
        const filter: SavedSearchFiltersDto = {
          faculty: 'Computer Science',
        };
        
        const result = savedSearchService.matchesFilter(listing, filter);
        expect(result).toBe(true);
      });

      it('should match by partial faculty name', () => {
        const listing = createTestListing();
        const filter: SavedSearchFiltersDto = {
          faculty: 'Computer',
        };
        
        const result = savedSearchService.matchesFilter(listing, filter);
        expect(result).toBe(true);
      });

      it('should match by university_id', () => {
        const listing = createTestListing();
        const filter: SavedSearchFiltersDto = {
          university_id: 'univ-1',
        };
        
        const result = savedSearchService.matchesFilter(listing, filter);
        expect(result).toBe(true);
      });

      it('should not match by wrong university_id', () => {
        const listing = createTestListing();
        const filter: SavedSearchFiltersDto = {
          university_id: 'univ-2',
        };
        
        const result = savedSearchService.matchesFilter(listing, filter);
        expect(result).toBe(false);
      });

      it('should match by faculty_id', () => {
        const listing = createTestListing();
        const filter: SavedSearchFiltersDto = {
          faculty_id: 'fac-1',
        };
        
        const result = savedSearchService.matchesFilter(listing, filter);
        expect(result).toBe(true);
      });

      it('should not match by wrong faculty_id', () => {
        const listing = createTestListing();
        const filter: SavedSearchFiltersDto = {
          faculty_id: 'fac-2',
        };
        
        const result = savedSearchService.matchesFilter(listing, filter);
        expect(result).toBe(false);
      });
    });

    describe('Combined Filters', () => {
      it('should match when all filters match', () => {
        const listing = createTestListing();
        const filter: SavedSearchFiltersDto = {
          moduleCode: 'CS101',
          condition: 'good',
          annotationLevel: 'light',
          priceMin: '30',
          priceMax: '50',
          book_title: 'Clean Code',
          author: 'Robert C. Martin',
        };
        
        const result = savedSearchService.matchesFilter(listing, filter);
        expect(result).toBe(true);
      });

      it('should reject when moduleCode does not match', () => {
        const listing = createTestListing();
        const filter: SavedSearchFiltersDto = {
          moduleCode: 'CS102',
          condition: 'good',
          priceMin: '30',
          priceMax: '50',
        };
        
        const result = savedSearchService.matchesFilter(listing, filter);
        expect(result).toBe(false);
      });

      it('should reject when condition does not match', () => {
        const listing = createTestListing();
        const filter: SavedSearchFiltersDto = {
          moduleCode: 'CS101',
          condition: 'new',
          priceMin: '30',
          priceMax: '50',
        };
        
        const result = savedSearchService.matchesFilter(listing, filter);
        expect(result).toBe(false);
      });

      it('should reject when price is out of range', () => {
        const listing = createTestListing();
        const filter: SavedSearchFiltersDto = {
          moduleCode: 'CS101',
          condition: 'good',
          priceMin: '50',
          priceMax: '100',
        };
        
        const result = savedSearchService.matchesFilter(listing, filter);
        expect(result).toBe(false);
      });

      it('should reject when book title does not match', () => {
        const listing = createTestListing();
        const filter: SavedSearchFiltersDto = {
          moduleCode: 'CS101',
          condition: 'good',
          book_title: 'Wrong Title',
        };
        
        const result = savedSearchService.matchesFilter(listing, filter);
        expect(result).toBe(false);
      });

      it('should handle case-insensitive text matching in combined filters', () => {
        const listing = createTestListing();
        const filter: SavedSearchFiltersDto = {
          book_title: 'clean code',
          author: 'robert c. martin',
          faculty: 'computer science',
          search: 'clean code textbook',
        };
        
        const result = savedSearchService.matchesFilter(listing, filter);
        expect(result).toBe(true);
      });

      it('should handle all filters together', () => {
        const listing = createTestListing();
        const filter: SavedSearchFiltersDto = {
          moduleCode: 'CS101',
          modules: ['CS101', 'CS102'],
          faculty: 'Computer Science',
          book_title: 'Clean Code',
          author: 'Robert C. Martin',
          isbn: '978-0132350884',
          edition: '1',
          priceMin: '30',
          priceMax: '50',
          condition: 'good',
          annotationLevel: 'light',
          search: 'Clean',
          university_id: 'univ-1',
          faculty_id: 'fac-1',
        };
        
        const result = savedSearchService.matchesFilter(listing, filter);
        expect(result).toBe(true);
      });
    });
  });
  describe('findMatchingSavedSearches & Event Integration', () => {
    beforeEach(async () => {
      
      await savedSearchRepo.delete({});
      await notificationRepo.delete({});
      await listingRepo.delete({});
    });

    describe('findMatchingSavedSearches', () => {
      it('should find matching saved searches for a listing', async () => {
        
        const savedSearch1 = await savedSearchRepo.save({
          user_id: testUser1.id,
          filter_json: { moduleCode: 'CS101', condition: 'good' },
          created_at: new Date(),
        } as SavedSearch);

        const savedSearch2 = await savedSearchRepo.save({
          user_id: testUser2.id,
          filter_json: { moduleCode: 'CS101', priceMin: '30', priceMax: '50' },
          created_at: new Date(),
        } as SavedSearch);

        const savedSearch3 = await savedSearchRepo.save({
          user_id: testUser3.id,
          filter_json: { moduleCode: 'CS102' },
          created_at: new Date(),
        } as SavedSearch);

        const listing = createTestListing();

        const matches = await savedSearchService.findMatchingSavedSearches(listing);

        expect(matches).toHaveLength(2);
        expect(matches.map(m => m.userId)).toContain(testUser1.id);
        expect(matches.map(m => m.userId)).toContain(testUser2.id);
        expect(matches.map(m => m.savedSearchId)).toContain(savedSearch1.id);
        expect(matches.map(m => m.savedSearchId)).toContain(savedSearch2.id);
        expect(matches.map(m => m.savedSearchId)).not.toContain(savedSearch3.id);
      });

      it('should return empty array when no saved searches match', async () => {
        await savedSearchRepo.save({
          user_id: testUser1.id,
          filter_json: { moduleCode: 'CS999' },
          created_at: new Date(),
        } as SavedSearch);

        const listing = createTestListing();
        const matches = await savedSearchService.findMatchingSavedSearches(listing);
        
        expect(matches).toHaveLength(0);
      });

      it('should throw NotFoundException when listing is null', async () => {
        await expect(savedSearchService.findMatchingSavedSearches(null as any))
          .rejects
          .toThrow('Listing not found');
      });
    });

    describe('Event Emission on Listing Creation', () => {
      it('should emit events when listing matches saved searches', async () => {
        const eventSpy = jest.fn();
        eventEmitter.on('saved-search.match', eventSpy);

        
        await savedSearchRepo.save({
          user_id: testUser1.id,
          filter_json: { moduleCode: 'CS101', priceMin: '30', priceMax: '50' },
          created_at: new Date(),
        } as SavedSearch);

        await savedSearchRepo.save({
          user_id: testUser2.id,
          filter_json: { moduleCode: 'CS101', condition: 'good' },
          created_at: new Date(),
        } as SavedSearch);

        
        const createDto = {
          title: 'Integration Test Textbook',
          bookId: testBook.id,
          moduleId: testModule.id,
          condition: 'good' as const,
          annotationLevel: 'light' as const,
          price: 45.99,
          photoUrls: [],
          hasNotes: false,
          description: 'Great condition textbook',
        };

        const listing = await listingsService.createListing(testUser1.id, createDto);

        
        await new Promise(resolve => setTimeout(resolve, 500));

        
        expect(eventSpy).toHaveBeenCalledTimes(2);
        expect(eventSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: testUser1.id,
            listingId: listing.id,
            listingTitle: 'Integration Test Textbook',
          })
        );
        expect(eventSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: testUser2.id,
            listingId: listing.id,
            listingTitle: 'Integration Test Textbook',
          })
        );

        eventEmitter.off('saved-search.match', eventSpy);
      });

      it('should not emit events when no saved searches match', async () => {
        const eventSpy = jest.fn();
        eventEmitter.on('saved-search.match', eventSpy);

        await savedSearchRepo.save({
          user_id: testUser1.id,
          filter_json: { moduleCode: 'CS999' },
          created_at: new Date(),
        } as SavedSearch);

        const createDto = {
          title: 'No Match Textbook',
          bookId: testBook.id,
          moduleId: testModule.id,
          condition: 'good' as const,
          annotationLevel: 'light' as const,
          price: 45.99,
          photoUrls: [],
          hasNotes: false,
          description: 'Great condition textbook',
        };

        await listingsService.createListing(testUser1.id, createDto);

        await new Promise(resolve => setTimeout(resolve, 500));

        expect(eventSpy).not.toHaveBeenCalled();

        eventEmitter.off('saved-search.match', eventSpy);
      });
    });

    describe('Notification Creation', () => {
      it('should create notifications for matching saved searches', async () => {
        
        await savedSearchRepo.save({
          user_id: testUser1.id,
          filter_json: { moduleCode: 'CS101', priceMin: '30', priceMax: '50' },
          created_at: new Date(),
        } as SavedSearch);

        await savedSearchRepo.save({
          user_id: testUser2.id,
          filter_json: { moduleCode: 'CS101', condition: 'good' },
          created_at: new Date(),
        } as SavedSearch);

        const createDto = {
          title: 'Notification Test Textbook',
          bookId: testBook.id,
          moduleId: testModule.id,
          condition: 'good' as const,
          annotationLevel: 'light' as const,
          price: 45.99,
          photoUrls: [],
          hasNotes: false,
          description: 'Great condition textbook',
        };

        await listingsService.createListing(testUser1.id, createDto);

        
        await new Promise(resolve => setTimeout(resolve, 1000));

        const notifications = await notificationRepo.find({
          where: { type: 'SAVED_SEARCH_MATCH' },
        });

        expect(notifications.length).toBeGreaterThanOrEqual(2);
        
        const user1Notifications = notifications.filter(n => n.user_id === testUser1.id);
        const user2Notifications = notifications.filter(n => n.user_id === testUser2.id);
        
        expect(user1Notifications.length).toBeGreaterThan(0);
        expect(user2Notifications.length).toBeGreaterThan(0);
        
        const notification = user1Notifications[0];
        expect(notification.title).toBe('New Listing Match Found! 🎉');
        expect(notification.message).toContain('Notification Test Textbook');
        expect(notification.data.listingId).toBeDefined();
        expect(notification.data.savedSearchId).toBeDefined();
      });
    });

    describe('End-to-End Flow', () => {
      it('should complete full flow: create saved search → create listing → get notification', async () => {
       
        const savedSearch = await savedSearchService.createSavedSearch(
          testUser1.id,
          {
            filter_json: {
              moduleCode: 'CS101',
              condition: 'good',
              priceMin: '30',
              priceMax: '50',
            },
          }
        );

        expect(savedSearch).toBeDefined();

        
        const createDto = {
          title: 'End-to-End Test Textbook',
          bookId: testBook.id,
          moduleId: testModule.id,
          condition: 'good' as const,
          annotationLevel: 'light' as const,
          price: 45.99,
          photoUrls: [],
          hasNotes: false,
          description: 'Great condition textbook',
        };

        const listing = await listingsService.createListing(testUser2.id, createDto);
        expect(listing).toBeDefined();

        
        await new Promise(resolve => setTimeout(resolve, 1000));

        
        const notifications = await notificationRepo.find({
          where: { 
            user_id: testUser1.id,
            type: 'SAVED_SEARCH_MATCH',
          },
          order: { created_at: 'DESC' },
        });

        expect(notifications.length).toBeGreaterThan(0);
        
        const notification = notifications[0];
        expect(notification.message).toContain('End-to-End Test Textbook');
        expect(notification.data.listingId).toBe(listing.id);
        expect(notification.data.savedSearchId).toBe(savedSearch.id);

        
        expect(notification.data).toMatchObject({
          listingId: listing.id,
          savedSearchId: savedSearch.id,
          matchDate: expect.any(String),
        });
      });

      it('should handle multiple users with different saved searches', async () => {
        // Create different saved searches for different users
        await savedSearchRepo.save({
          user_id: testUser1.id,
          filter_json: { moduleCode: 'CS101', priceMin: '30', priceMax: '50' },
          created_at: new Date(),
        } as SavedSearch);

        await savedSearchRepo.save({
          user_id: testUser2.id,
          filter_json: { moduleCode: 'CS101', condition: 'good' },
          created_at: new Date(),
        } as SavedSearch);

        await savedSearchRepo.save({
          user_id: testUser3.id,
          filter_json: { moduleCode: 'CS102' }, // Won't match
          created_at: new Date(),
        } as SavedSearch);

        const createDto = {
          title: 'Multiple Users Test',
          bookId: testBook.id,
          moduleId: testModule.id,
          condition: 'good' as const,
          annotationLevel: 'light' as const,
          price: 45.99,
          photoUrls: [],
          hasNotes: false,
          description: 'Great condition textbook',
        };

        await listingsService.createListing(testUser1.id, createDto);

        await new Promise(resolve => setTimeout(resolve, 1000));

        const notifications = await notificationRepo.find({
          where: { type: 'SAVED_SEARCH_MATCH' },
          order: { created_at: 'DESC' },
        });

        
        const user1Notifs = notifications.filter(n => n.user_id === testUser1.id);
        const user2Notifs = notifications.filter(n => n.user_id === testUser2.id);
        const user3Notifs = notifications.filter(n => n.user_id === testUser3.id);

        expect(user1Notifs.length).toBeGreaterThan(0);
        expect(user2Notifs.length).toBeGreaterThan(0);
        expect(user3Notifs.length).toBe(0);
      });
    });
  })
});