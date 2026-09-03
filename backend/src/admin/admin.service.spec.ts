import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AdminService } from './admin.service';
import { User } from '../database/entities/users.entity';
import { Listing, ListingStatus, ListingsStatus } from '../database/entities/listing.entity';
import { AuditLog } from '../database/entities/audit_log.entity';
import { AuditLogFiltersDto } from './dto/audit-log-filters.dto';
import { NotFoundException } from '@nestjs/common';
import { validate } from 'class-validator';
import { SavedSearchesService } from '../saved_search/saved_search.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('AdminService', () => {
  let service: AdminService;
  let module: TestingModule;

  // Mock data
  const mockUser: Partial<User> = {
    id: 'user-123',
    email: 'admin@example.com',
    role: 'admin',
  };

  const mockListing: Partial<Listing> = {
    id: 'listing-123',
    title: 'Test Listing',
    status: ListingStatus.PENDING,
    reviewer: undefined,
    reviewed_at: undefined,
    seller: mockUser as User,
    book: { id: 'book-123' } as any,
    module: null,
    condition: 'good',
    annotation_level: 'none',
    price: 100,
    photo_urls: [],
    listing_status: ListingsStatus.AVAILABLE,
    has_notes: false,
    created_at: new Date(),
    updated_at: undefined,
    deleted_at: undefined,
    description: 'Test description',
  };

  const mockAuditLog: Partial<AuditLog> = {
    id: 'log-123',
    entity_type: 'listing',
    entity_id: 'listing-123',
    action: 'APPROVE_LISTING',
    performedBy: mockUser as User,
    notes: 'Test Listing',
    reason: undefined,
    performed_at: new Date(),
  };

  // Mock repositories
  const mockListingRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockAuditLogRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockEntityManager = {
    transaction: jest.fn(),
    getRepository: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(AuditLog),
          useValue: {
            emit: jest.fn(),
          }
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit:jest.fn()
          }
        },
        {
          provide : SavedSearchesService,
          useValue: {
            findMatchingSavedSearches: jest.fn(),
            matchesFilter: jest.fn(),
          }
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await module.close();
  });

  // Services tests

  describe('approveListing', () => {
    it('should approve a listing successfully', async () => {
      const listingId = 'listing-123';
      const userId = 'user-123';

      mockEntityManager.transaction.mockImplementation(async (callback) => {
        const manager = {
          getRepository: jest.fn().mockReturnValue({
            findOne: jest.fn()
              .mockResolvedValueOnce(mockUser as User)
              .mockResolvedValueOnce(mockListing as Listing),
            save: jest.fn().mockResolvedValue({
              ...mockListing,
              status: ListingStatus.APPROVED,
              reviewer: mockUser as User,
              reviewed_at: expect.any(Date),
            } as Listing),
            create: jest.fn().mockReturnValue(mockAuditLog as AuditLog),
          }),
        };
        return callback(manager);
      });

      const result = await service.approveListing(listingId, userId);

      expect(result.status).toBe(ListingStatus.APPROVED);
      expect(result.reviewer).toEqual(mockUser);
      expect(result.reviewed_at).toBeDefined();
    });

    it('should throw NotFoundException if admin not found', async () => {
      const listingId = 'listing-123';
      const userId = 'user-456';

      mockEntityManager.transaction.mockImplementation(async (callback) => {
        const manager = {
          getRepository: jest.fn().mockReturnValue({
            findOne: jest.fn().mockResolvedValue(null),
            save: jest.fn(),
            create: jest.fn(),
          }),
        };
        return callback(manager);
      });

      await expect(service.approveListing(listingId, userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.approveListing(listingId, userId)).rejects.toThrow(
        `User with ID ${userId} not found`,
      );
    });

    it('should throw NotFoundException if listing not found', async () => {
      const listingId = 'listing-456';
      const userId = 'user-123';

      mockEntityManager.transaction.mockImplementation(async (callback) => {
        const manager = {
          getRepository: jest.fn().mockReturnValue({
            findOne: jest.fn()
              .mockResolvedValueOnce(mockUser as User)
              .mockResolvedValueOnce(null),
            save: jest.fn(),
            create: jest.fn(),
          }),
        };
        return callback(manager);
      });

      await expect(service.approveListing(listingId, userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.approveListing(listingId, userId)).rejects.toThrow(
        `Listing with ID ${listingId} not found`,
      );
    });
  });

  describe('rejectListing', () => {
    it('should reject a listing with reason successfully', async () => {
      const listingId = 'listing-123';
      const userId = 'user-123';
      const reason = 'Inappropriate content';

      mockEntityManager.transaction.mockImplementation(async (callback) => {
        const manager = {
          getRepository: jest.fn().mockReturnValue({
            findOne: jest.fn()
              .mockResolvedValueOnce(mockUser as User)
              .mockResolvedValueOnce(mockListing as Listing),
            save: jest.fn().mockResolvedValue({
              ...mockListing,
              status: ListingStatus.REJECTED,
              reviewer: mockUser as User,
              reviewed_at: expect.any(Date),
            } as Listing),
            create: jest.fn().mockReturnValue({
              ...mockAuditLog,
              reason,
              action: 'REJECT_LISTING',
            } as AuditLog),
          }),
        };
        return callback(manager);
      });

      const result = await service.rejectListing(listingId, userId, reason);

      expect(result.status).toBe(ListingStatus.REJECTED);
      expect(result.reviewer).toEqual(mockUser);
      expect(result.reviewed_at).toBeDefined();
    });

    it('should throw NotFoundException if admin not found when rejecting', async () => {
      const listingId = 'listing-123';
      const userId = 'user-456';
      const reason = 'Invalid content';

      mockEntityManager.transaction.mockImplementation(async (callback) => {
        const manager = {
          getRepository: jest.fn().mockReturnValue({
            findOne: jest.fn().mockResolvedValue(null),
            save: jest.fn(),
            create: jest.fn(),
          }),
        };
        return callback(manager);
      });

      await expect(
        service.rejectListing(listingId, userId, reason),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if listing not found when rejecting', async () => {
      const listingId = 'listing-456';
      const userId = 'user-123';
      const reason = 'Invalid content';

      mockEntityManager.transaction.mockImplementation(async (callback) => {
        const manager = {
          getRepository: jest.fn().mockReturnValue({
            findOne: jest.fn()
              .mockResolvedValueOnce(mockUser as User)
              .mockResolvedValueOnce(null),
            save: jest.fn(),
            create: jest.fn(),
          }),
        };
        return callback(manager);
      });

      await expect(
        service.rejectListing(listingId, userId, reason),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAuditLog', () => {
    it('should return audit logs with default pagination', async () => {
      const filters: AuditLogFiltersDto = {};
      const mockLogs = [mockAuditLog as AuditLog];
      const mockTotal = 1;

      mockAuditLogRepository.findAndCount.mockResolvedValue([
        mockLogs,
        mockTotal,
      ]);
      mockEntityManager.getRepository.mockReturnValue(mockAuditLogRepository);

      const result = await service.getAuditLog(filters);

      expect(result.logs).toEqual(mockLogs);
      expect(result.total).toBe(mockTotal);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.totalPages).toBe(1);
      expect(mockAuditLogRepository.findAndCount).toHaveBeenCalledWith({
        where: {},
        relations: ['performedBy'],
        order: { performed_at: 'DESC' },
        skip: 0,
        take: 20,
      });
    });

    it('should apply all filters correctly', async () => {
      const filters: AuditLogFiltersDto = {
        performedBy: 'user-123',
        action: 'APPROVE_LISTING',
        entityType: 'listing',
        entityId: 'listing-123',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        page: 2,
        limit: 10,
        search: 'test',
      };

      const mockLogs = [mockAuditLog as AuditLog];
      const mockTotal = 1;

      mockAuditLogRepository.findAndCount.mockResolvedValue([
        mockLogs,
        mockTotal,
      ]);
      mockEntityManager.getRepository.mockReturnValue(mockAuditLogRepository);

      const result = await service.getAuditLog(filters);

      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      expect(mockAuditLogRepository.findAndCount).toHaveBeenCalledWith({
        where: expect.objectContaining({
          performedBy: { id: 'user-123' },
          action: 'APPROVE_LISTING',
          entity_type: 'listing',
          entity_id: 'listing-123',
          notes: expect.any(Object),
        }),
        relations: ['performedBy'],
        order: { performed_at: 'DESC' },
        skip: 10,
        take: 10,
      });
    });

    it('should handle date range with only startDate', async () => {
      const filters: AuditLogFiltersDto = {
        startDate: '2023-01-01',
      };

      mockAuditLogRepository.findAndCount.mockResolvedValue([[], 0]);
      mockEntityManager.getRepository.mockReturnValue(mockAuditLogRepository);

      await service.getAuditLog(filters);

      expect(mockAuditLogRepository.findAndCount).toHaveBeenCalledWith({
        where: expect.objectContaining({
          performed_at: expect.any(Object),
        }),
        relations: ['performedBy'],
        order: { performed_at: 'DESC' },
        skip: 0,
        take: 20,
      });
    });

    it('should handle date range with both startDate and endDate', async () => {
      const filters: AuditLogFiltersDto = {
        startDate: '2023-01-01',
        endDate: '2023-12-31',
      };

      mockAuditLogRepository.findAndCount.mockResolvedValue([[], 0]);
      mockEntityManager.getRepository.mockReturnValue(mockAuditLogRepository);

      await service.getAuditLog(filters);

      expect(mockAuditLogRepository.findAndCount).toHaveBeenCalledWith({
        where: expect.objectContaining({
          performed_at: expect.any(Object),
        }),
        relations: ['performedBy'],
        order: { performed_at: 'DESC' },
        skip: 0,
        take: 20,
      });
    });

    it('should handle search filter', async () => {
      const filters: AuditLogFiltersDto = {
        search: 'test listing',
      };

      mockAuditLogRepository.findAndCount.mockResolvedValue([[], 0]);
      mockEntityManager.getRepository.mockReturnValue(mockAuditLogRepository);

      await service.getAuditLog(filters);

      expect(mockAuditLogRepository.findAndCount).toHaveBeenCalledWith({
        where: expect.objectContaining({
          notes: expect.any(Object),
        }),
        relations: ['performedBy'],
        order: { performed_at: 'DESC' },
        skip: 0,
        take: 20,
      });
    });

    it('should return empty results when no logs found', async () => {
      const filters: AuditLogFiltersDto = {};

      mockAuditLogRepository.findAndCount.mockResolvedValue([[], 0]);
      mockEntityManager.getRepository.mockReturnValue(mockAuditLogRepository);

      const result = await service.getAuditLog(filters);

      expect(result.logs).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('should calculate totalPages correctly', async () => {
      const filters: AuditLogFiltersDto = {
        limit: 10,
      };

      mockAuditLogRepository.findAndCount.mockResolvedValue([[], 25]);
      mockEntityManager.getRepository.mockReturnValue(mockAuditLogRepository);

      const result = await service.getAuditLog(filters);

      expect(result.totalPages).toBe(3);
    });
  });

  describe('getusersAdmin', () => {
    it('should return all admin users', async () => {
      const mockAdmins: Partial<User>[] = [
        { id: '1', email: 'admin1@example.com' },
        { id: '2', email: 'admin2@example.com' },
      ];

      mockUserRepository.find.mockResolvedValue(mockAdmins);

      const result = await service.getusersAdmin();

      expect(result).toEqual(mockAdmins);
      expect(mockUserRepository.find).toHaveBeenCalledWith({
        select: {
          id: true,
          email: true,
        },
        where: {
          role: 'admin',
        },
      });
    });

    it('should return empty array when no admin users exist', async () => {
      mockUserRepository.find.mockResolvedValue([]);

      const result = await service.getusersAdmin();

      expect(result).toEqual([]);
      expect(mockUserRepository.find).toHaveBeenCalled();
    });

    it('should handle database error gracefully', async () => {
      const error = new Error('Database connection failed');
      mockUserRepository.find.mockRejectedValue(error);

      await expect(service.getusersAdmin()).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  // DTO validation tests

  describe('AuditLogFiltersDto Validation', () => {
    let dto: AuditLogFiltersDto;

    beforeEach(() => {
      dto = new AuditLogFiltersDto();
    });

    it('should be valid with empty object', async () => {
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should be valid with all fields provided correctly', async () => {
      dto.performedBy = '123e4567-e89b-12d3-a456-426614174000';
      dto.action = 'APPROVE_LISTING';
      dto.entityType = 'listing';
      dto.entityId = 'listing-123';
      dto.startDate = '2023-01-01';
      dto.endDate = '2023-12-31';
      dto.page = 1;
      dto.limit = 20;
      dto.search = 'test';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate performedBy as UUID', async () => {
      dto.performedBy = 'invalid-uuid';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('performedBy');
      expect(errors[0].constraints).toHaveProperty('isUuid');
    });

    it('should validate page as integer >= 1', async () => {
      dto.page = 0;
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('page');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should validate limit as integer >= 1', async () => {
      dto.limit = 0;
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('limit');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should validate startDate as date string', async () => {
      dto.startDate = 'invalid-date';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('startDate');
      expect(errors[0].constraints).toHaveProperty('isDateString');
    });

    it('should validate endDate as date string', async () => {
      dto.endDate = 'invalid-date';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('endDate');
      expect(errors[0].constraints).toHaveProperty('isDateString');
    });

    it('should accept valid UUID for performedBy', async () => {
      dto.performedBy = '123e4567-e89b-12d3-a456-426614174000';
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept valid date strings', async () => {
      dto.startDate = '2023-01-01T00:00:00Z';
      dto.endDate = '2023-12-31T23:59:59Z';
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should have default values for page and limit', () => {
      expect(dto.page).toBe(1);
      expect(dto.limit).toBe(20);
    });

    it('should accept search parameter', async () => {
  const dto = new AuditLogFiltersDto();
  dto.search = 'test search query';
  const errors = await validate(dto);
  expect(errors).toHaveLength(0); 
});

    it('should reject non-date strings for date fields', async () => {
      dto.startDate = 'not-a-date';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isDateString');
    });

    it('should accept valid date strings in different formats', async () => {
      dto.startDate = '2023-01-01';
      dto.endDate = '2023-12-31';
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject negative page numbers', async () => {
      dto.page = -1;
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should reject negative limit numbers', async () => {
      dto.limit = -5;
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should accept large numbers for page and limit', async () => {
      dto.page = 999999;
      dto.limit = 999999;
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  // Integration scenario tests

  describe('Integration scenarios', () => {
    it('should handle complete workflow: approve -> get audit log -> get admins', async () => {
      // Approve listing
      mockEntityManager.transaction.mockImplementation(async (callback) => {
        const manager = {
          getRepository: jest.fn().mockReturnValue({
            findOne: jest.fn()
              .mockResolvedValueOnce(mockUser as User)
              .mockResolvedValueOnce(mockListing as Listing),
            save: jest.fn().mockResolvedValue({
              ...mockListing,
              status: ListingStatus.APPROVED,
              reviewer: mockUser as User,
              reviewed_at: new Date(),
            } as Listing),
            create: jest.fn().mockReturnValue(mockAuditLog as AuditLog),
          }),
        };
        return callback(manager);
      });

      const approved = await service.approveListing('listing-123', 'user-123');
      expect(approved.status).toBe(ListingStatus.APPROVED);

      // Get audit log
      mockAuditLogRepository.findAndCount.mockResolvedValue([
        [mockAuditLog as AuditLog],
        1,
      ]);
      mockEntityManager.getRepository.mockReturnValue(mockAuditLogRepository);

      const logs = await service.getAuditLog({});
      expect(logs.logs).toHaveLength(1);
      expect(logs.logs[0].action).toBe('APPROVE_LISTING');

      // Get admins
      mockUserRepository.find.mockResolvedValue([
        { id: 'user-123', email: 'admin@example.com' },
      ]);

      const admins = await service.getusersAdmin();
      expect(admins).toHaveLength(1);
      expect(admins[0].email).toBe('admin@example.com');
    });

    it('should handle complete workflow: reject -> get audit log with filters', async () => {
      const reason = 'Inappropriate content';

      // Reject listing
      mockEntityManager.transaction.mockImplementation(async (callback) => {
        const manager = {
          getRepository: jest.fn().mockReturnValue({
            findOne: jest.fn()
              .mockResolvedValueOnce(mockUser as User)
              .mockResolvedValueOnce(mockListing as Listing),
            save: jest.fn().mockResolvedValue({
              ...mockListing,
              status: ListingStatus.REJECTED,
              reviewer: mockUser as User,
              reviewed_at: new Date(),
            } as Listing),
            create: jest.fn().mockReturnValue({
              ...mockAuditLog,
              reason,
              action: 'REJECT_LISTING',
            } as AuditLog),
          }),
        };
        return callback(manager);
      });

      const rejected = await service.rejectListing(
        'listing-123',
        'user-123',
        reason,
      );
      expect(rejected.status).toBe(ListingStatus.REJECTED);

      // Get audit log with filters
      mockAuditLogRepository.findAndCount.mockResolvedValue([
        [{ ...mockAuditLog, action: 'REJECT_LISTING', reason } as AuditLog],
        1,
      ]);
      mockEntityManager.getRepository.mockReturnValue(mockAuditLogRepository);

      const logs = await service.getAuditLog({
        action: 'REJECT_LISTING',
        search: 'Inappropriate',
      });

      expect(logs.logs).toHaveLength(1);
      expect(logs.logs[0].action).toBe('REJECT_LISTING');
      expect(logs.logs[0].reason).toBe(reason);
    });
  });

  // Edge cases

  describe('Edge cases', () => {
    it('should handle large pagination values', async () => {
      const filters: AuditLogFiltersDto = {
        page: 1000,
        limit: 1000,
      };

      mockAuditLogRepository.findAndCount.mockResolvedValue([[], 0]);
      mockEntityManager.getRepository.mockReturnValue(mockAuditLogRepository);

      const result = await service.getAuditLog(filters);

      expect(result.page).toBe(1000);
      expect(result.limit).toBe(1000);
      expect(mockAuditLogRepository.findAndCount).toHaveBeenCalledWith({
        where: {},
        relations: ['performedBy'],
        order: { performed_at: 'DESC' },
        skip: 999000,
        take: 1000,
      });
    });

    it('should handle date range with very old dates', async () => {
      const filters: AuditLogFiltersDto = {
        startDate: '2000-01-01',
        endDate: '2001-01-01',
      };

      mockAuditLogRepository.findAndCount.mockResolvedValue([[], 0]);
      mockEntityManager.getRepository.mockReturnValue(mockAuditLogRepository);

      await service.getAuditLog(filters);

      expect(mockAuditLogRepository.findAndCount).toHaveBeenCalledWith({
        where: expect.objectContaining({
          performed_at: expect.any(Object),
        }),
        relations: ['performedBy'],
        order: { performed_at: 'DESC' },
        skip: 0,
        take: 20,
      });
    });

    it('should handle special characters in search', async () => {
      const filters: AuditLogFiltersDto = {
        search: '!@#$%^&*()',
      };

      mockAuditLogRepository.findAndCount.mockResolvedValue([[], 0]);
      mockEntityManager.getRepository.mockReturnValue(mockAuditLogRepository);

      await service.getAuditLog(filters);

      expect(mockAuditLogRepository.findAndCount).toHaveBeenCalledWith({
        where: expect.objectContaining({
          notes: expect.any(Object),
        }),
        relations: ['performedBy'],
        order: { performed_at: 'DESC' },
        skip: 0,
        take: 20,
      });
    });

    it('should handle null/undefined filters gracefully', async () => {
      const filters = {};

      mockAuditLogRepository.findAndCount.mockResolvedValue([[], 0]);
      mockEntityManager.getRepository.mockReturnValue(mockAuditLogRepository);

      await service.getAuditLog(filters);

      expect(mockAuditLogRepository.findAndCount).toHaveBeenCalledWith({
        where: {},
        relations: ['performedBy'],
        order: { performed_at: 'DESC' },
        skip: 0,
        take: 20,
      });
    });
  });
});