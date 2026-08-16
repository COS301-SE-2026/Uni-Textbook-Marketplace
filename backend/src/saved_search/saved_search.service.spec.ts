import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

import { SavedSearchesService } from './saved_search.service';
import { SavedSearch } from '../database/entities/saved_search.entity';
import { User } from '../database/entities/users.entity';
import { Listing } from '../database/entities/listing.entity';
import { Book } from '../database/entities/book.entity';
import { Module as ModuleEntity } from '../database/entities/module.entity';
import { Faculty } from '../database/entities/faculty.entity';
import { University } from '../database/entities/university.entity';
import { SavedSearchFiltersDto } from './dto/saved_search.dto';

describe('SavedSearchesService - Part 1: Core Setup and Edge Cases', () => {
  let service: SavedSearchesService;
  let savedSearchRepository: jest.Mocked<Repository<SavedSearch>>;
  let listingRepository: jest.Mocked<Repository<Listing>>;

  // Mock data
  const mockUniversity: University = {
    id: 'univ-1',
    name: 'Test University',
  } as University;

  const mockFaculty: Faculty = {
    id: 'fac-1',
    name: 'Computer Science',
    university: mockUniversity,
  } as Faculty;

  const mockModule: ModuleEntity = {
    id: 'mod-1',
    code: 'CS101',
    name: 'Introduction to Computer Science',
    faculty: mockFaculty,
    university: mockUniversity,
    semester: 1,
  };

  const mockBook: Book = {
    id: 'book-1',
    isbn: '978-0132350884',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    edition: 1,
    publisher: 'Prentice Hall',
  };

  const mockListing: Listing = {
    id: 'listing-1',
    title: 'Clean Code Textbook',
    seller: {} as User,
    book: mockBook,
    module: mockModule,
    condition: 'good',
    annotation_level: 'light',
    price: 45.99,
    reviewer: null,
    reviewed_at: new Date(),
    photo_urls: [],
    status: 'APPROVED' as any,
    listing_status: 'AVAILABLE' as any,
    has_notes: false,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
    description: 'Great condition textbook',
  };

  const mockSavedSearch: SavedSearch = {
    id: 'search-1',
    user_id: 'user-1',
    user: {} as User,
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
      const listingWithoutModule = { ...mockListing, module: null };
      const filter: SavedSearchFiltersDto = {
        moduleCode: 'CS101',
      };
      const result = service.matchesFilter(listingWithoutModule, filter);
      expect(result).toBe(false);
    });

    it('should handle listing with null book', () => {
      const listingWithoutBook = { ...mockListing, book: null };
      const filter: SavedSearchFiltersDto = {
        book_title: 'Clean Code',
      };
      const result = service.matchesFilter(listingWithoutBook, filter);
      expect(result).toBe(false);
    });

    it('should handle listing with null price', () => {
      const listingWithoutPrice = { ...mockListing, price: null as any };
      const filter: SavedSearchFiltersDto = {
        priceMin: '10',
        priceMax: '50',
      };
      const result = service.matchesFilter(listingWithoutPrice, filter);
      expect(result).toBe(false);
    });
  });
});
