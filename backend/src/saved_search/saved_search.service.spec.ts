import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

import { SavedSearchesService } from './saved_search.service';
import { SavedSearch } from '../database/entities/saved_search.entity';
import { User } from '../database/entities/users.entity';
import { Listing, ListingStatus, ListingsStatus } from '../database/entities/listing.entity';
import { Book } from '../database/entities/book.entity';
import { Module as ModuleEntity } from '../database/entities/module.entity';
import { Faculty } from '../database/entities/faculty.entity';
import { University } from '../database/entities/university.entity';
import { SavedSearchFiltersDto } from './dto/saved_search.dto';

describe('Initial Tests', () => {
  let service: SavedSearchesService;
  let savedSearchRepository: jest.Mocked<Repository<SavedSearch>>;
  let listingRepository: jest.Mocked<Repository<Listing>>;


  const mockUniversity: University = {
    id: 'univ-1',
    name: 'Test University',
    email_domain: 'test.edu',
    users: [],
    modules: [],
  } as University;

  
  const mockFaculty: Faculty = {
    id: 'fac-1',
    name: 'Computer Science',
    university: mockUniversity,
    created_at: new Date(),
  };

  
  const mockModule: ModuleEntity = {
    id: 'mod-1',
    code: 'CS101',
    name: 'Introduction to Computer Science',
    faculty: mockFaculty,
    semester: 1,
    university: mockUniversity,
  };

  
  const mockBook: Book = {
    id: 'book-1',
    isbn: '978-0132350884',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    edition: 1,
    publisher: 'Prentice Hall',
  };

  
  const mockUser: User = {
    id: 'user-1',
    email: 'test@test.com',
    password_hash: 'hashedpassword',
    first_name: 'Test',
    last_name: 'User',
    is_verified: true,
    role: 'student',
    university: mockUniversity,
    faculty: mockFaculty,
    listings: [],
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null as any,
  };

  
  function createTestListing(overrides: Partial<Listing> = {}): Listing {
    const baseListing: Listing = {
      id: 'listing-1',
      title: 'Clean Code Textbook',
      seller: mockUser,
      book: mockBook,
      module: mockModule,
      condition: 'good',
      annotation_level: 'light',
      price: 45.99,
      reviewer: mockUser,
      reviewed_at: new Date(),
      photo_urls: [],
      status: ListingStatus.APPROVED,
      listing_status: ListingsStatus.AVAILABLE,
      has_notes: false,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null as any,
      description: 'Great condition textbook',
      ...overrides,
    };
    return baseListing;
  }


  const mockListing = createTestListing();

  const mockSavedSearch: SavedSearch = {
    id: 'search-1',
    user_id: 'user-1',
    user: mockUser,
    filter_json: {},
    created_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SavedSearchesService,
        {
          provide: DataSource,
          useValue: {
            getRepository: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(SavedSearch),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Listing),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Book),
          useValue: {},
        },
        {
          provide: getRepositoryToken(ModuleEntity),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<SavedSearchesService>(SavedSearchesService);
    savedSearchRepository = module.get(getRepositoryToken(SavedSearch));
    listingRepository = module.get(getRepositoryToken(Listing));
  });

  describe('Basic Edge Cases', () => {
    it('should return true when filter is empty', () => {
      const filter: SavedSearchFiltersDto = {};
      const result = service.matchesFilter(mockListing, filter);
      expect(result).toBe(true);
    });

    it('should return true when filter has only undefined/null values', () => {
      const filter: SavedSearchFiltersDto = {
        moduleCode: undefined,
        priceMin: null as any,
        priceMax: null as any,
        condition: undefined,
      };
      const result = service.matchesFilter(mockListing, filter);
      expect(result).toBe(true);
    });

    it('should handle listing with null module', () => {
      const listingWithoutModule = createTestListing({ module: null });
      const filter: SavedSearchFiltersDto = {
        moduleCode: 'CS101',
      };
      const result = service.matchesFilter(listingWithoutModule, filter);
      expect(result).toBe(false);
    });

    it('should handle listing with null book', () => {
      const listingWithoutBook = createTestListing({ book: null as any });
      const filter: SavedSearchFiltersDto = {
        book_title: 'Clean Code',
      };
      const result = service.matchesFilter(listingWithoutBook, filter);
      expect(result).toBe(false);
    });

    it('should handle listing with null price', () => {
      const listingWithoutPrice = createTestListing({ price: null as any });
      const filter: SavedSearchFiltersDto = {
        priceMin: '10',
        priceMax: '50',
      };
      const result = service.matchesFilter(listingWithoutPrice, filter);
      expect(result).toBe(false);
    });
  });

  describe('Partial Matches', () => {
    it('should match when filter has only moduleCode', () => {
      const filter: SavedSearchFiltersDto = {
        moduleCode: 'CS101',
      };
      const result = service.matchesFilter(mockListing, filter);
      expect(result).toBe(true);
    });

    it('should match when filter has only condition', () => {
      const filter: SavedSearchFiltersDto = {
        condition: 'good',
      };
      const result = service.matchesFilter(mockListing, filter);
      expect(result).toBe(true);
    });

    it('should match when filter has only annotationLevel', () => {
      const filter: SavedSearchFiltersDto = {
        annotationLevel: 'light',
      };
      const result = service.matchesFilter(mockListing, filter);
      expect(result).toBe(true);
    });

    it('should ignore unspecified fields in filter', () => {
      const filter: SavedSearchFiltersDto = {
        condition: 'good',
        
      };
      const result = service.matchesFilter(mockListing, filter);
      expect(result).toBe(true);
    });

    it('should match when filter has modules array containing listing module', () => {
      const filter: SavedSearchFiltersDto = {
        modules: ['CS101', 'CS102', 'CS103'],
      };
      const result = service.matchesFilter(mockListing, filter);
      expect(result).toBe(true);
    });

    it('should not match when modules array does not contain listing module', () => {
      const filter: SavedSearchFiltersDto = {
        modules: ['CS102', 'CS103'],
      };
      const result = service.matchesFilter(mockListing, filter);
      expect(result).toBe(false);
    });
  });

  describe('Price Range Only Matches', () => {
    it('should match when price is between min and max', () => {
      const filter: SavedSearchFiltersDto = {
        priceMin: '30',
        priceMax: '50',
      };
      const result = service.matchesFilter(mockListing, filter);
      expect(result).toBe(true);
    });

    it('should match when price is exactly at min', () => {
      const listingWithExactPrice = createTestListing({ price: 30 });
      const filter: SavedSearchFiltersDto = {
        priceMin: '30',
        priceMax: '50',
      };
      const result = service.matchesFilter(listingWithExactPrice, filter);
      expect(result).toBe(true);
    });

    it('should match when price is exactly at max', () => {
      const listingWithExactPrice = createTestListing({ price: 50 });
      const filter: SavedSearchFiltersDto = {
        priceMin: '30',
        priceMax: '50',
      };
      const result = service.matchesFilter(listingWithExactPrice, filter);
      expect(result).toBe(true);
    });

    it('should reject when price is below min', () => {
      const filter: SavedSearchFiltersDto = {
        priceMin: '50',
        priceMax: '100',
      };
      const result = service.matchesFilter(mockListing, filter);
      expect(result).toBe(false);
    });

    it('should reject when price is above max', () => {
      const filter: SavedSearchFiltersDto = {
        priceMin: '10',
        priceMax: '30',
      };
      const result = service.matchesFilter(mockListing, filter);
      expect(result).toBe(false);
    });

    it('should match when only min is specified', () => {
      const filter: SavedSearchFiltersDto = {
        priceMin: '40',
      };
      const result = service.matchesFilter(mockListing, filter);
      expect(result).toBe(true);
    });

    it('should match when only max is specified', () => {
      const filter: SavedSearchFiltersDto = {
        priceMax: '50',
      };
      const result = service.matchesFilter(mockListing, filter);
      expect(result).toBe(true);
    });

    it('should handle priceMin as number', () => {
      const filter: SavedSearchFiltersDto = {
        priceMin: 30 as any,
        priceMax: 50 as any,
      };
      const result = service.matchesFilter(mockListing, filter);
      expect(result).toBe(true);
    });

    it('should handle empty string price values', () => {
      const filter: SavedSearchFiltersDto = {
        priceMin: '',
        priceMax: '',
      };
      const result = service.matchesFilter(mockListing, filter);
      expect(result).toBe(true);
    });
  });
});