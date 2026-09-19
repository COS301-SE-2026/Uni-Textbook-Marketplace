import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BundlesService } from './bundles.service';
import { ModuleBook } from '../database/entities/module-book.entity';
import {
  Listing,
  ListingStatus,
} from '../database/entities/listing.entity';

describe('BundlesService', () => {
  let service: BundlesService;
  let moduleBookRepository: Repository<ModuleBook>;
  let listingRepository: Repository<Listing>;

  const mockBook1 = {
    id: 'book-1',
    title: 'Introduction to Algorithms',
  };

  const mockBook2 = {
    id: 'book-2',
    title: 'Computer Networking',
  };

  const mockModule1 = {
    id: 'module-1',
    code: 'COS212',
    name: 'Data Structures',
  };

  const mockModule2 = {
    id: 'module-2',
    code: 'COS216',
    name: 'Computer Networks',
  };

  const mockSeller = {
    id: 'seller-1',
    first_name: 'Test',
    last_name: 'Seller',
  };

  const mockModuleBook1 = {
    id: 'module-book-1',
    module: mockModule1,
    book: mockBook1,
  };

  const mockModuleBook2 = {
    id: 'module-book-2',
    module: mockModule2,
    book: mockBook2,
  };

  const mockApprovedListing1 = {
    id: 'listing-1',
    book: mockBook1,
    seller: mockSeller,
    price: 450,
    status: ListingStatus.APPROVED,
  };

  const mockApprovedListing2 = {
    id: 'listing-2',
    book: mockBook2,
    seller: mockSeller,
    price: 600,
    status: ListingStatus.APPROVED,
  };

  const mockModuleBookRepository = {
    find: jest.fn(),
  };

  const mockListingRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BundlesService,
        {
          provide: getRepositoryToken(ModuleBook),
          useValue: mockModuleBookRepository,
        },
        {
          provide: getRepositoryToken(Listing),
          useValue: mockListingRepository,
        },
      ],
    }).compile();

    service = module.get<BundlesService>(BundlesService);

    moduleBookRepository = module.get<Repository<ModuleBook>>(
      getRepositoryToken(ModuleBook),
    );

    listingRepository = module.get<Repository<Listing>>(
      getRepositoryToken(Listing),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('optimizeBundle', () => {
    it('should find required books and approved listings', async () => {
      mockModuleBookRepository.find.mockResolvedValue([
        mockModuleBook1,
        mockModuleBook2,
      ]);

      mockListingRepository.find.mockResolvedValue([
        mockApprovedListing1,
        mockApprovedListing2,
      ]);

      const result = await service.optimizeBundle([
        'module-1',
        'module-2',
      ]);

      expect(result.requiredBooks).toHaveLength(2);
      expect(result.approvedListings).toHaveLength(2);
      expect(result.optimizedBundle.listings).toHaveLength(2);
      expect(result.optimizedBundle.sellerIds).toEqual(['seller-1']);
      expect(result.optimizedBundle.totalPrice).toBe(1050);
      expect(result.optimizedBundle.booksCovered).toBe(2);

      expect(mockModuleBookRepository.find).toHaveBeenCalledWith({
        where: [
          {
            module: {
              id: 'module-1',
            },
          },
          {
            module: {
              id: 'module-2',
            },
          },
        ],
        relations: ['book', 'module'],
      });

      expect(mockListingRepository.find).toHaveBeenCalledWith({
        where: [
          {
            book: {
              id: 'book-1',
            },
            status: ListingStatus.APPROVED,
          },
          {
            book: {
              id: 'book-2',
            },
            status: ListingStatus.APPROVED,
          },
        ],
        relations: ['book', 'seller'],
      });
    });

    it('should deduplicate books required by multiple modules', async () => {
      const sharedBookModule1 = {
        ...mockModuleBook1,
      };

      const sharedBookModule2 = {
        ...mockModuleBook2,
        book: mockBook1,
      };

      mockModuleBookRepository.find.mockResolvedValue([
        sharedBookModule1,
        sharedBookModule2,
      ]);

      mockListingRepository.find.mockResolvedValue([
        mockApprovedListing1,
      ]);

      const result = await service.optimizeBundle([
        'module-1',
        'module-2',
      ]);

      expect(result.requiredBooks).toHaveLength(1);
      expect(result.requiredBooks[0].book.id).toBe('book-1');
    });

    it('should throw an error when no modules are provided', async () => {
      await expect(service.optimizeBundle([])).rejects.toThrow(
        'At least one module must be selected',
      );

      expect(mockModuleBookRepository.find).not.toHaveBeenCalled();
      expect(mockListingRepository.find).not.toHaveBeenCalled();
    });

    it('should return an empty listing array when no approved listings exist', async () => {
  mockModuleBookRepository.find.mockResolvedValue([
    mockModuleBook1,
  ]);

  mockListingRepository.find.mockResolvedValue([]);

  const result = await service.optimizeBundle(['module-1']);

  expect(result.requiredBooks).toHaveLength(1);
  expect(result.approvedListings).toEqual([]);

  expect(result.optimizedBundle.listings).toEqual([]);
  expect(result.optimizedBundle.sellerIds).toEqual([]);
  expect(result.optimizedBundle.totalPrice).toBe(0);
  expect(result.optimizedBundle.booksCovered).toBe(0);
});
  });
  describe('findOptimizedBundle', () => {
  it('should select sellers that cover the required books', () => {
    const listingsBySeller = new Map([
      [
        'seller-1',
        [
          mockApprovedListing1,
          mockApprovedListing2,
        ],
      ],
    ]);

    const result = (service as any).findOptimizedBundle(
      ['book-1', 'book-2'],
      listingsBySeller,
    );

    expect(result.listings).toHaveLength(2);
    expect(result.sellerIds).toEqual(['seller-1']);
    expect(result.totalPrice).toBe(1050);
    expect(result.booksCovered).toBe(2);
  });

  it('should use multiple sellers when necessary', () => {
    const seller2Listing = {
      ...mockApprovedListing2,
      seller: {
        id: 'seller-2',
        first_name: 'Second',
        last_name: 'Seller',
      },
    };

    const listingsBySeller = new Map([
      ['seller-1', [mockApprovedListing1]],
      ['seller-2', [seller2Listing]],
    ]);

    const result = (service as any).findOptimizedBundle(
      ['book-1', 'book-2'],
      listingsBySeller,
    );

    expect(result.listings).toHaveLength(2);
    expect(result.sellerIds).toHaveLength(2);
    expect(result.totalPrice).toBe(1050);
    expect(result.booksCovered).toBe(2);
  });

  it('should not select listings for books that are already covered', () => {
    const seller2Book1 = {
      ...mockApprovedListing1,
      id: 'listing-3',
      seller: {
        id: 'seller-2',
        first_name: 'Second',
        last_name: 'Seller',
      },
      price: 100,
    };

    const seller2Book2 = {
      ...mockApprovedListing2,
      id: 'listing-4',
      seller: {
        id: 'seller-2',
        first_name: 'Second',
        last_name: 'Seller',
      },
      price: 100,
    };

    const listingsBySeller = new Map([
      ['seller-1', [mockApprovedListing1]],
      ['seller-2', [seller2Book1, seller2Book2]],
    ]);

    const result = (service as any).findOptimizedBundle(
      ['book-1', 'book-2'],
      listingsBySeller,
    );

    expect(result.booksCovered).toBe(2);
    expect(result.listings).toHaveLength(2);
  });

  it('should return partially covered bundle when some books have no listings', () => {
    const listingsBySeller = new Map([
      ['seller-1', [mockApprovedListing1]],
    ]);

    const result = (service as any).findOptimizedBundle(
      ['book-1', 'book-2'],
      listingsBySeller,
    );

    expect(result.listings).toHaveLength(1);
    expect(result.sellerIds).toHaveLength(1);
    expect(result.totalPrice).toBe(450);
    expect(result.booksCovered).toBe(1);
  });
});
});