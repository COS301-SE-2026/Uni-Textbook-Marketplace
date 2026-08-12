import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { SavedSearchesService } from './saved_search.service';
import { SavedSearch } from '../database/entities/saved_search.entity';
import { User } from '../database/entities/users.entity';
import { Listing, ListingStatus, ListingsStatus } from '../database/entities/listing.entity';
import { Book } from '../database/entities/book.entity';
import { Module as ModuleEntity } from '../database/entities/module.entity';
import {
  CreateSavedSearchDto,
  GetSavedSearchesQueryDto,
  SavedSearchFiltersDto,
} from './dto/saved_search.dto';

describe('SavedSearchesService', () => {
  let service: SavedSearchesService;
  let savedSearchRepo: Repository<SavedSearch>;
  let userRepo: Repository<User>;
  let listingRepo: Repository<Listing>;

  // UUIDs for testing
  const validUuid = '123e4567-e89b-12d3-a456-426614174000';
  const validUuid2 = '223e4567-e89b-12d3-a456-426614174001';
  const validUuid3 = '323e4567-e89b-12d3-a456-426614174002';

  //Mocks


  const createMockUniversity = (): any => {
    return {
      id: 'university-1',
      name: 'University of Pretoria',
    };
  };

  const createMockFaculty = (): any => {
    return {
      id: 'faculty-1',
      name: 'Engineering',
      university: createMockUniversity(),
    };
  };

  //User mock
  const createMockUser = (): User => {
    const user = new User();
    user.id = validUuid;
    user.email = 'test@tuks.ac.za';
    user.first_name = 'Test';
    user.last_name = 'User';
    user.password_hash = 'hashed';
    user.is_verified = true;
    user.role = 'student';
    user.university = createMockUniversity();
    user.faculty = null;
    user.listings = [];
    user.created_at = new Date();
    user.updated_at = new Date();
    user.deleted_at = new Date();
    return user;
  };

  // Book mock
  const createMockBook = (): Book => {
    const book = new Book();
    book.id = 'book-1';
    book.title = 'Test Book';
    book.isbn = '1234567890';
    book.author = 'Test Author';
    book.edition = 3;
    book.publisher = 'Publisher';
    return book;
  };

  // Module mock
  const createMockModule = (): ModuleEntity => {
    const module = new ModuleEntity();
    module.id = 'module-1';
    module.code = 'COS301';
    module.name = 'Software Engineering';
    module.faculty = createMockFaculty();
    module.semester = 1;
    module.university = createMockUniversity();
    return module;
  };

  // Listing mock
  const createMockListing = (): Listing => {
    const listing = new Listing();
    listing.id = validUuid2;
    listing.title = 'Test Listing';
    listing.description = 'Test description';
    listing.condition = 'good';
    listing.annotation_level = 'light';
    listing.price = 250;
    listing.status = ListingStatus.APPROVED;
    listing.listing_status = ListingsStatus.AVAILABLE;
    listing.photo_urls = [];
    listing.has_notes = false;
    listing.seller = createMockUser();
    listing.book = createMockBook();
    listing.module = createMockModule();
    listing.reviewer = createMockUser();
    listing.reviewed_at = new Date();
    listing.created_at = new Date();
    listing.updated_at = new Date();
    listing.deleted_at = new Date();
    return listing;
  };

  // SavedSearch mock
  const createMockSavedSearch = (): SavedSearch => {
    const search = new SavedSearch();
    search.id = validUuid3;
    search.user_id = validUuid;
    search.user = createMockUser();
    search.filter_json = {
      moduleCode: 'COS301',
      priceMin: 100,
      priceMax: 500,
      condition: 'good',
    } as any;
    search.created_at = new Date();
    return search;
  };


  const mockUser = createMockUser();
  const mockBook = createMockBook();
  const mockModule = createMockModule();
  const mockListing = createMockListing();
  const mockSavedSearch = createMockSavedSearch();

  // Mock repositories

  const mockSavedSearchRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
    manager: {
      query: jest.fn(),
    },
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
  };

  const mockListingRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockBookRepository = {
    findOne: jest.fn(),
  };

  const mockModuleRepository = {
    findOne: jest.fn(),
  };

  // Mock DataSource
  const mockDataSource = {
    getRepository: jest.fn().mockImplementation((entity) => {
      if (entity === SavedSearch) return mockSavedSearchRepository;
      if (entity === User) return mockUserRepository;
      if (entity === Listing) return mockListingRepository;
      if (entity === Book) return mockBookRepository;
      if (entity === ModuleEntity) return mockModuleRepository;
      return mockSavedSearchRepository;
    }),
  };



  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SavedSearchesService,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<SavedSearchesService>(SavedSearchesService);
    savedSearchRepo = mockDataSource.getRepository(SavedSearch);
    userRepo = mockDataSource.getRepository(User);
    listingRepo = mockDataSource.getRepository(Listing);


    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });



  describe('createSavedSearch', () => {
    const createDto: CreateSavedSearchDto = {
      filter_json: {
        moduleCode: 'COS301',
        priceMin: 100,
        priceMax: 500,
        condition: 'good',
      } as any,
    };

    it('should create a saved search successfully (happy path)', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockSavedSearchRepository.create.mockReturnValue(mockSavedSearch);
      mockSavedSearchRepository.save.mockResolvedValue(mockSavedSearch);

      // Act
      const result = await service.createSavedSearch(validUuid, createDto);

      // Assert
      expect(result).toEqual(mockSavedSearch);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: validUuid },
      });
      expect(mockSavedSearchRepository.create).toHaveBeenCalledWith({
        user_id: validUuid,
        filter_json: createDto.filter_json,
      });
      expect(mockSavedSearchRepository.save).toHaveBeenCalledWith(mockSavedSearch);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.createSavedSearch('non-existent-user', createDto)).rejects.toThrow(
        new NotFoundException('User not found'),
      );
      expect(mockSavedSearchRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when priceMin is greater than priceMax', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      const invalidDto: CreateSavedSearchDto = {
        filter_json: {
          priceMin: 500,
          priceMax: 100,
        } as any,
      };

      // Act & Assert
      await expect(service.createSavedSearch(validUuid, invalidDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockSavedSearchRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid condition', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      const invalidDto: CreateSavedSearchDto = {
        filter_json: {
          condition: 'invalid_condition',
        } as any,
      };

      // Act & Assert
      await expect(service.createSavedSearch(validUuid, invalidDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockSavedSearchRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid annotationLevel', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      const invalidDto: CreateSavedSearchDto = {
        filter_json: {
          annotationLevel: 'invalid_level',
        } as any,
      };

      // Act & Assert
      await expect(service.createSavedSearch(validUuid, invalidDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockSavedSearchRepository.save).not.toHaveBeenCalled();
    });

    it('should handle priceMin as string', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      const dtoWithStringPrice: CreateSavedSearchDto = {
        filter_json: {
          priceMin: '100',
          priceMax: '500',
        } as any,
      };
      mockSavedSearchRepository.create.mockReturnValue(mockSavedSearch);
      mockSavedSearchRepository.save.mockResolvedValue(mockSavedSearch);

      // Act
      const result = await service.createSavedSearch(validUuid, dtoWithStringPrice);

      // Assert
      expect(result).toEqual(mockSavedSearch);
      expect(mockSavedSearchRepository.create).toHaveBeenCalledWith({
        user_id: validUuid,
        filter_json: dtoWithStringPrice.filter_json,
      });
    });

    it('should accept empty filter (matches all)', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      const emptyDto: CreateSavedSearchDto = {
        filter_json: {} as any,
      };
      mockSavedSearchRepository.create.mockReturnValue(mockSavedSearch);
      mockSavedSearchRepository.save.mockResolvedValue(mockSavedSearch);

      // Act
      const result = await service.createSavedSearch(validUuid, emptyDto);

      // Assert
      expect(result).toEqual(mockSavedSearch);
    });
  });

  //getUserSavedSearches

  describe('getUserSavedSearches', () => {
    const query: GetSavedSearchesQueryDto = {
      page: 1,
      limit: 10,
    };

    it('should return paginated saved searches for a user (happy path)', async () => {
      // Arrange
      const mockResult = [[mockSavedSearch], 1];
      mockSavedSearchRepository.findAndCount.mockResolvedValue(mockResult);

      // Act
      const result = await service.getUserSavedSearches(validUuid, query);

      // Assert
      expect(result).toEqual({
        data: [mockSavedSearch],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(mockSavedSearchRepository.findAndCount).toHaveBeenCalledWith({
        where: { user_id: validUuid },
        order: { created_at: 'DESC' },
        skip: 0,
        take: 10,
      });
    });

    it('should use default pagination values when not provided', async () => {
      // Arrange
      const emptyQuery: GetSavedSearchesQueryDto = {};
      const mockResult = [[mockSavedSearch], 1];
      mockSavedSearchRepository.findAndCount.mockResolvedValue(mockResult);

      // Act
      const result = await service.getUserSavedSearches(validUuid, emptyQuery);

      // Assert
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(mockSavedSearchRepository.findAndCount).toHaveBeenCalledWith({
        where: { user_id: validUuid },
        order: { created_at: 'DESC' },
        skip: 0,
        take: 20,
      });
    });

    it('should return empty array when user has no saved searches', async () => {
      // Arrange
      mockSavedSearchRepository.findAndCount.mockResolvedValue([[], 0]);

      // Act
      const result = await service.getUserSavedSearches(validUuid, query);

      // Assert
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('should handle pagination correctly for page 2', async () => {
      // Arrange
      const page2Query: GetSavedSearchesQueryDto = { page: 2, limit: 10 };
      const mockResult = [[mockSavedSearch], 1];
      mockSavedSearchRepository.findAndCount.mockResolvedValue(mockResult);

      // Act
      await service.getUserSavedSearches(validUuid, page2Query);

      // Assert
      expect(mockSavedSearchRepository.findAndCount).toHaveBeenCalledWith({
        where: { user_id: validUuid },
        order: { created_at: 'DESC' },
        skip: 10,
        take: 10,
      });
    });
  });

  // deleteSavedSearch 

  describe('deleteSavedSearch', () => {
    it('should delete a saved search successfully (happy path)', async () => {
      // Arrange
      mockSavedSearchRepository.findOne.mockResolvedValue(mockSavedSearch);
      mockSavedSearchRepository.delete.mockResolvedValue({ affected: 1, raw: {} });

      // Act
      await service.deleteSavedSearch(validUuid3, validUuid);

      // Assert
      expect(mockSavedSearchRepository.findOne).toHaveBeenCalledWith({
        where: { id: validUuid3, user_id: validUuid },
      });
      expect(mockSavedSearchRepository.delete).toHaveBeenCalledWith(validUuid3);
    });

    it('should throw NotFoundException when search does not exist', async () => {
      // Arrange
      mockSavedSearchRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.deleteSavedSearch('non-existent', validUuid)).rejects.toThrow(
        new NotFoundException('Saved search not found or does not belong to user'),
      );
      expect(mockSavedSearchRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when search belongs to another user', async () => {
      // Arrange
      mockSavedSearchRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.deleteSavedSearch(validUuid3, 'other-user')).rejects.toThrow(
        new NotFoundException('Saved search not found or does not belong to user'),
      );
      expect(mockSavedSearchRepository.delete).not.toHaveBeenCalled();
    });
  });

  // getSavedSearchById 

  describe('getSavedSearchById', () => {
    it('should return a saved search by ID (happy path)', async () => {
      // Arrange
      mockSavedSearchRepository.findOne.mockResolvedValue(mockSavedSearch);

      // Act
      const result = await service.getSavedSearchById(validUuid3, validUuid);

      // Assert
      expect(result).toEqual(mockSavedSearch);
      expect(mockSavedSearchRepository.findOne).toHaveBeenCalledWith({
        where: { id: validUuid3, user_id: validUuid },
      });
    });

    it('should throw NotFoundException when search does not exist', async () => {
      // Arrange
      mockSavedSearchRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getSavedSearchById('non-existent', validUuid)).rejects.toThrow(
        new NotFoundException('Saved search not found'),
      );
    });

    it('should throw NotFoundException when search belongs to another user', async () => {
      // Arrange
      mockSavedSearchRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getSavedSearchById(validUuid3, 'other-user')).rejects.toThrow(
        new NotFoundException('Saved search not found'),
      );
    });
  });

  // matchesFilter tests

  describe('matchesFilter', () => {
    it('should return true when listing matches all filters', () => {
      // Arrange
      const filter: SavedSearchFiltersDto = {
        moduleCode: 'COS301',
        priceMin: 100,
        priceMax: 500,
        condition: 'good',
        annotationLevel: 'light',
        search: 'Test',
      } as any;

      // Act
      const result = service.matchesFilter(mockListing, filter);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when module code does not match', () => {
      // Arrange
      const filter: SavedSearchFiltersDto = {
        moduleCode: 'INVALID_MODULE',
      } as any;

      // Act
      const result = service.matchesFilter(mockListing, filter);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when price is below minimum', () => {
      // Arrange
      const filter: SavedSearchFiltersDto = {
        priceMin: 500,
      } as any;

      // Act
      const result = service.matchesFilter(mockListing, filter);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when price is above maximum', () => {
      // Arrange
      const filter: SavedSearchFiltersDto = {
        priceMax: 100,
      } as any;

      // Act
      const result = service.matchesFilter(mockListing, filter);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when condition does not match', () => {
      // Arrange
      const filter: SavedSearchFiltersDto = {
        condition: 'poor',
      } as any;

      // Act
      const result = service.matchesFilter(mockListing, filter);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when annotationLevel does not match', () => {
      // Arrange
      const filter: SavedSearchFiltersDto = {
        annotationLevel: 'heavy',
      } as any;

      // Act
      const result = service.matchesFilter(mockListing, filter);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when search text does not match', () => {
      // Arrange
      const filter: SavedSearchFiltersDto = {
        search: 'NonExistentText',
      } as any;

      // Act
      const result = service.matchesFilter(mockListing, filter);

      // Assert
      expect(result).toBe(false);
    });

    it('should return true when filter has no filters (empty object)', () => {
      // Arrange
      const filter: SavedSearchFiltersDto = {} as any;

      // Act
      const result = service.matchesFilter(mockListing, filter);

      // Assert
      expect(result).toBe(true);
    });

    it('should handle priceMin and priceMax as strings', () => {
      // Arrange
      const filter: SavedSearchFiltersDto = {
        priceMin: '100',
        priceMax: '500',
      } as any;

      // Act
      const result = service.matchesFilter(mockListing, filter);

      // Assert
      expect(result).toBe(true);
    });

    it('should handle invalid price strings gracefully', () => {
      // Arrange
      const filter: SavedSearchFiltersDto = {
        priceMin: 'invalid',
        priceMax: 'invalid',
      } as any;

      // Act
      const result = service.matchesFilter(mockListing, filter);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true when module matches but is case-insensitive for faculty', () => {
      // Arrange
      const listingWithFaculty = createMockListing();
      listingWithFaculty.module = createMockModule();
      const filter: SavedSearchFiltersDto = {
        faculty: 'engineering',
      } as any;

      // Act
      const result = service.matchesFilter(listingWithFaculty, filter);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when faculty does not match', () => {
      // Arrange
      const listingWithFaculty = createMockListing();
      listingWithFaculty.module = createMockModule();
      const filter: SavedSearchFiltersDto = {
        faculty: 'Science',
      } as any;

      // Act
      const result = service.matchesFilter(listingWithFaculty, filter);

      // Assert
      expect(result).toBe(false);
    });

    it('should return true when edition matches', () => {
      // Arrange
      const filter: SavedSearchFiltersDto = {
        edition: '3',
      } as any;

      // Act
      const result = service.matchesFilter(mockListing, filter);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when edition does not match', () => {
      // Arrange
      const filter: SavedSearchFiltersDto = {
        edition: '5',
      } as any;

      // Act
      const result = service.matchesFilter(mockListing, filter);

      // Assert
      expect(result).toBe(false);
    });
  });

  // findMatchingSavedSearches tests

  describe('findMatchingSavedSearches', () => {
    const matchingSearch = createMockSavedSearch();
    const nonMatchingSearch = createMockSavedSearch();
    nonMatchingSearch.id = 'non-matching-id';
    nonMatchingSearch.filter_json = { moduleCode: 'INVALID' } as any;

    it('should return matching saved searches for a listing (happy path)', async () => {
      // Arrange
      mockSavedSearchRepository.find.mockResolvedValue([matchingSearch, nonMatchingSearch]);

      // Act
      const result = await service.findMatchingSavedSearches(mockListing);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].savedSearchId).toBe(validUuid3);
      expect(result[0].userId).toBe(validUuid);
    });

    it('should return empty array when no saved searches match', async () => {
      // Arrange
      mockSavedSearchRepository.find.mockResolvedValue([nonMatchingSearch]);

      // Act
      const result = await service.findMatchingSavedSearches(mockListing);

      // Assert
      expect(result).toHaveLength(0);
    });

    it('should throw NotFoundException when listing does not exist', async () => {
      // Arrange
      const nullListing = null as any;

      // Act & Assert
      await expect(service.findMatchingSavedSearches(nullListing)).rejects.toThrow(
        new NotFoundException('Listing not found'),
      );
    });

    it('should return empty array when no saved searches exist', async () => {
      // Arrange
      mockSavedSearchRepository.find.mockResolvedValue([]);

      // Act
      const result = await service.findMatchingSavedSearches(mockListing);

      // Assert
      expect(result).toHaveLength(0);
    });
  });

  // getAllSavedSearches tests

  describe('getAllSavedSearches', () => {
    it('should return all saved searches (happy path)', async () => {
      // Arrange
      const mockSearches = [mockSavedSearch];
      mockSavedSearchRepository.find.mockResolvedValue(mockSearches);

      // Act
      const result = await service.getAllSavedSearches();

      // Assert
      expect(result).toEqual(mockSearches);
      expect(mockSavedSearchRepository.find).toHaveBeenCalled();
    });

    it('should return empty array when no saved searches exist', async () => {
      // Arrange
      mockSavedSearchRepository.find.mockResolvedValue([]);

      // Act
      const result = await service.getAllSavedSearches();

      // Assert
      expect(result).toEqual([]);
    });
  });

  // getSavedSearchesByUserIds tests

  describe('getSavedSearchesByUserIds', () => {
    it('should return saved searches for multiple users (happy path)', async () => {
      // Arrange
      const userIds = [validUuid, 'other-user-id'];
      const mockSearches = [mockSavedSearch];
      mockSavedSearchRepository.find.mockResolvedValue(mockSearches);

      // Act
      const result = await service.getSavedSearchesByUserIds(userIds);

      // Assert
      expect(result).toEqual(mockSearches);
      expect(mockSavedSearchRepository.find).toHaveBeenCalledWith({
        where: { user_id: expect.anything() },
      });
    });

    it('should return empty array when no user IDs provided', async () => {
      // Arrange
      mockSavedSearchRepository.find.mockResolvedValue([]);

      // Act
      const result = await service.getSavedSearchesByUserIds([]);

      // Assert
      expect(result).toEqual([]);
    });

    it('should return empty array when no saved searches found for users', async () => {
      // Arrange
      const userIds = ['non-existent-1', 'non-existent-2'];
      mockSavedSearchRepository.find.mockResolvedValue([]);

      // Act
      const result = await service.getSavedSearchesByUserIds(userIds);

      // Assert
      expect(result).toEqual([]);
    });
  });
});


