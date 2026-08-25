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
});