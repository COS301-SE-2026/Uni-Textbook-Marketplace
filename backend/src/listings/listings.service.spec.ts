import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

import { ListingsService } from './listings.service';
import { Listing, ListingStatus } from '../database/entities/listing.entity';
import { User } from '../database/entities/users.entity';
import { Book } from '../database/entities/book.entity';
import { Module as ModuleEntity } from '../database/entities/module.entity';
import { CreateListingDto } from './dto/create-listing.dto';

describe('ListingsService', () => {
  let service: ListingsService;
  let listingRepo: Repository<Listing>;
  let userRepo: Repository<User>;
  let bookRepo: Repository<Book>;
  let moduleRepo: Repository<ModuleEntity>;

  // Mock data
  const mockUser = {
    id: 'user-1',
    email: 'test@tuks.ac.za',
    first_name: 'Test',
    last_name: 'User',
  };

  const mockBook = {
    id: 'book-1',
    title: 'Test Book',
    isbn: '1234567890',
    author: 'Test Author',
  };

  const mockModule = {
    id: 'module-1',
    code: 'COS132',
    name: 'Imperative Programming',
  };

  const mockListing = {
    id: 'listing-1',
    title: 'Test Listing',
    condition: 'Good',
    annotation_level: 'Light',
    price: 49.99,
    status: ListingStatus.PENDING,
    photo_urls: [],
    has_notes: false,
    seller: mockUser,
    book: mockBook,
    module: mockModule,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockApprovedListing = {
    ...mockListing,
    id: 'listing-2',
    status: ListingStatus.APPROVED,
  };

  const mockPendingListing = {
    ...mockListing,
    id: 'listing-3',
    status: ListingStatus.PENDING,
  };

  // Mock repositories
  const mockListingRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
  };

  const mockUserRepository = {
    findOneBy: jest.fn(),
  };

  const mockBookRepository = {
    findOneBy: jest.fn(),
  };

  const mockModuleRepository = {
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListingsService,
        {
          provide: getRepositoryToken(Listing),
          useValue: mockListingRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Book),
          useValue: mockBookRepository,
        },
        {
          provide: getRepositoryToken(ModuleEntity),
          useValue: mockModuleRepository,
        },
      ],
    }).compile();

    service = module.get<ListingsService>(ListingsService);
    listingRepo = module.get<Repository<Listing>>(getRepositoryToken(Listing));
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
    bookRepo = module.get<Repository<Book>>(getRepositoryToken(Book));
    moduleRepo = module.get<Repository<ModuleEntity>>(getRepositoryToken(ModuleEntity));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createListing', () => {
    const createListingDto: CreateListingDto = {
      title: 'Test Listing',
      bookId: 'book-1',
      condition: 'good',
      annotationLevel: 'light',
      price: 49.99,
      moduleId: 'module-1',
      photoUrls: ['url1', 'url2'],
      hasNotes: true,
    };

    // Happy path test 
    it('should create a new listing with PENDING status (happy path)', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockBookRepository.findOneBy.mockResolvedValue(mockBook);
      mockModuleRepository.findOneBy.mockResolvedValue(mockModule);
      mockListingRepository.create.mockReturnValue(mockListing);
      mockListingRepository.save.mockResolvedValue(mockListing);

      const result = await service.createListing('user-1', createListingDto);

      expect(result).toEqual(mockListing);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: 'user-1' });
      expect(mockBookRepository.findOneBy).toHaveBeenCalledWith({ id: 'book-1' });
      expect(mockModuleRepository.findOneBy).toHaveBeenCalledWith({ id: 'module-1' });
      expect(mockListingRepository.create).toHaveBeenCalledWith({
        title: createListingDto.title,
        seller: mockUser,
        book: mockBook,
        module: mockModule,
        condition: createListingDto.condition,
        annotation_level: createListingDto.annotationLevel,
        price: createListingDto.price,
        status: ListingStatus.PENDING,
        photo_urls: createListingDto.photoUrls,
        has_notes: createListingDto.hasNotes,
      });
      expect(mockListingRepository.save).toHaveBeenCalledWith(mockListing);
    });

    // User not found test
    it('should throw NotFoundException when user does not exist', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(service.createListing('non-existent-user', createListingDto)).rejects.toThrow(
        new NotFoundException('User not found')
      );
      expect(mockBookRepository.findOneBy).not.toHaveBeenCalled();
    });

    // Book not found
    it('should throw NotFoundException when book does not exist', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockBookRepository.findOneBy.mockResolvedValue(null);

      await expect(service.createListing('user-1', createListingDto)).rejects.toThrow(
        new NotFoundException('Book not found')
      );
      expect(mockModuleRepository.findOneBy).not.toHaveBeenCalled();
    });

    // Optional moduleId not provided
    it('should create listing without module when moduleId not provided', async () => {
      const dtoWithoutModule = { ...createListingDto, moduleId: undefined };
      
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockBookRepository.findOneBy.mockResolvedValue(mockBook);
      mockListingRepository.create.mockReturnValue({ ...mockListing, module: null });
      mockListingRepository.save.mockResolvedValue({ ...mockListing, module: null });

      const result = await service.createListing('user-1', dtoWithoutModule);

      expect(result.module).toBeNull();
      expect(mockModuleRepository.findOneBy).not.toHaveBeenCalled();
    });

    // Default values for optional fields
    it('should use default values for optional fields when not provided', async () => {
      const minimalDto: CreateListingDto = {
        title: 'Minimal Listing',
        bookId: 'book-1',
        condition: 'good',
        annotationLevel: 'none',
        price: 29.99,
      };

      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockBookRepository.findOneBy.mockResolvedValue(mockBook);
      mockListingRepository.create.mockReturnValue({
        ...mockListing,
        photo_urls: [],
        has_notes: false,
        module: null,
      });
      mockListingRepository.save.mockResolvedValue({
        ...mockListing,
        photo_urls: [],
        has_notes: false,
        module: null,
      });

      const result = await service.createListing('user-1', minimalDto);

      expect(result.photo_urls).toEqual([]);
      expect(result.has_notes).toBe(false);
      expect(result.module).toBeNull();
    });
  });

  describe('getAllApproved', () => {
    
    it('should return only listings with APPROVED status', async () => {
      const approvedListings = [
        mockApprovedListing,
        { ...mockApprovedListing, id: 'listing-4' },
      ];
      mockListingRepository.find.mockResolvedValue(approvedListings);

      const result = await service.getAllApproved();

      expect(result).toEqual(approvedListings);
      expect(mockListingRepository.find).toHaveBeenCalledWith({
        where: { status: ListingStatus.APPROVED },
        relations: ['book', 'module', 'seller'],
      });
    });

    it('should return empty array when no approved listings exist', async () => {
      mockListingRepository.find.mockResolvedValue([]);

      const result = await service.getAllApproved();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should not return PENDING or REJECTED listings', async () => {
      const allListings = [
        mockApprovedListing,
        mockPendingListing,
        { ...mockListing, id: 'listing-4', status: ListingStatus.REJECTED },
      ];
      
      mockListingRepository.find.mockResolvedValue([mockApprovedListing]);

      const result = await service.getAllApproved();

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(ListingStatus.APPROVED);
      expect(result).not.toContainEqual(expect.objectContaining({ status: ListingStatus.PENDING }));
      expect(result).not.toContainEqual(expect.objectContaining({ status: ListingStatus.REJECTED }));
    });
  });

  describe('getMyListings', () => {
    const userId = 'user-1';
    const userListings = [
      { ...mockListing, id: '1', seller: { id: userId } },
      { ...mockListing, id: '2', seller: { id: userId } },
    ];

    
    it('should return only listings belonging to the authenticated user', async () => {
      mockListingRepository.find.mockResolvedValue(userListings);

      const result = await service.getMyListings(userId);

      expect(result).toEqual(userListings);
      expect(mockListingRepository.find).toHaveBeenCalledWith({
        where: { seller: { id: userId } },
        relations: ['book', 'module'],
      });
    });

    it('should return empty array when user has no listings', async () => {
      mockListingRepository.find.mockResolvedValue([]);

      const result = await service.getMyListings('user-with-no-listings');

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should not return listings from other users', async () => {
      const otherUserListing = { ...mockListing, seller: { id: 'other-user' } };
      mockListingRepository.find.mockResolvedValue([]);

      const result = await service.getMyListings(userId);

      expect(result).not.toContainEqual(otherUserListing);
    });
  });

  describe('getListingById', () => {
   
    it('should return listing when valid ID is provided', async () => {
      mockListingRepository.findOne.mockResolvedValue(mockListing);

      const result = await service.getListingById('listing-1');

      expect(result).toEqual(mockListing);
      expect(mockListingRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'listing-1' },
        relations: ['book', 'module', 'seller'],
      });
    });

   
    it('should throw NotFoundException when listing does not exist', async () => {
      mockListingRepository.findOne.mockResolvedValue(null);

      await expect(service.getListingById('non-existent-id')).rejects.toThrow(
        new NotFoundException('Listing not found')
      );
    });

    it('should throw NotFoundException for empty string ID', async () => {
      mockListingRepository.findOne.mockResolvedValue(null);

      await expect(service.getListingById('')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPendingListings (Admin only)', () => {
    it('should return all listings with PENDING status', async () => {
      const pendingListings = [
        mockPendingListing,
        { ...mockPendingListing, id: 'listing-4' },
      ];
      mockListingRepository.find.mockResolvedValue(pendingListings);

      const result = await service.getPendingListings();

      expect(result).toEqual(pendingListings);
      expect(mockListingRepository.find).toHaveBeenCalledWith({
        where: { status: ListingStatus.PENDING },
        relations: ['book', 'seller'],
      });
    });

    it('should return empty array when no pending listings exist', async () => {
      mockListingRepository.find.mockResolvedValue([]);

      const result = await service.getPendingListings();

      expect(result).toEqual([]);
    });
  });

  describe('approveListing (Admin only)', () => {
    const adminId = 'admin-1';
    const approvedListing = { ...mockListing, status: ListingStatus.APPROVED };

    it('should approve a pending listing', async () => {
      mockListingRepository.findOne.mockResolvedValue(mockPendingListing);
      mockListingRepository.save.mockResolvedValue(approvedListing);

      const result = await service.approveListing('listing-1', adminId);

      expect(result.status).toBe(ListingStatus.APPROVED);
      expect(result.reviewer).toEqual({ id: adminId });
      expect(result.reviewed_at).toBeDefined();
      expect(mockListingRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when listing does not exist', async () => {
      mockListingRepository.findOne.mockResolvedValue(null);

      await expect(service.approveListing('non-existent-id', adminId)).rejects.toThrow(
        new NotFoundException('Listing not found')
      );
    });
  });

  describe('rejectListing (Admin only)', () => {
    const adminId = 'admin-1';
    const rejectedListing = { ...mockListing, status: ListingStatus.REJECTED };

    it('should reject a pending listing', async () => {
      mockListingRepository.findOne.mockResolvedValue(mockPendingListing);
      mockListingRepository.save.mockResolvedValue(rejectedListing);

      const result = await service.rejectListing('listing-1', adminId);

      expect(result.status).toBe(ListingStatus.REJECTED);
      expect(result.reviewer).toEqual({ id: adminId });
      expect(result.reviewed_at).toBeDefined();
      expect(mockListingRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when listing does not exist', async () => {
      mockListingRepository.findOne.mockResolvedValue(null);

      await expect(service.rejectListing('non-existent-id', adminId)).rejects.toThrow(
        new NotFoundException('Listing not found')
      );
    });
  });
});