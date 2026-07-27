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

  

});