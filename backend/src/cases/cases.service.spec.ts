import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { CasesService } from './cases.service';
import { Case } from '../../src/database/entities/case.entity';
import { User } from '../../src/database/entities/users.entity';
import { AuditLog } from '../../src/database/entities/audit_log.entity';
import { University } from '../../src/database/entities/university.entity';
import { Faculty } from '../../src/database/entities/faculty.entity';
import { Listing, ListingStatus } from '../../src/database/entities/listing.entity';
import { Book } from '../../src/database/entities/book.entity';
import { Module as ModuleEntity } from '../../src/database/entities/module.entity';
import { Report, ReportStatus } from '../../src/database/entities/report.entity';
import { CreateCaseDto } from './dto/create-case.dto';

describe('CasesService', () => {
  let service: CasesService;
  let caseRepo: jest.Mocked<Repository<Case>>;
  let userRepo: jest.Mocked<Repository<User>>;
  let auditLogRepo: jest.Mocked<Repository<AuditLog>>;

  const mockUniversity: University = {
    id: 'univ-1',
    name: 'University of Pretoria',
    email_domain: 'tuks.co.za',
    users: [],
    modules: [],
  } as University;

  const mockFaculty: Faculty = {
    id: 'fac-1',
    name: 'Engineering, Built Environment and IT',
    university: mockUniversity,
    modules: [],
    created_at: new Date(),
  } as Faculty;

  const mockListing: Listing = {
    id: 'listing-1',
    title: 'Test Listing',
    seller: null as any,
    book: null as any,
    module: null,
    condition: 'good',
    annotation_level: 'light',
    price: 50,
    reviewer: null as any,
    reviewed_at: null as any,
    photo_urls: [],
    status: ListingStatus.APPROVED,
    listing_status: 'AVAILABLE' as any,
    has_notes: false,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null as any,
    description: 'Test description',
    reports: [],
  } as Listing;

  const mockReport: Report = {
    id: 'report-1',
    reporter: null as any,
    listing: mockListing,
    reason: 'Test report reason',
    status: ReportStatus.PENDING,
    created_at: new Date(),
  } as Report;

  const mockUser: User = {
    id: 'user-123',
    email: 'banned@test.com',
    password_hash: 'hashed_password_123',
    first_name: 'Test',
    last_name: 'BannedUser',
    is_verified: true,
    is_banned: true,
    banned_at: new Date('2026-08-15T10:00:00Z'),
    banned_by: null as any,
    ban_reason: 'Violated platform rules - selling prohibited items',
    role: 'student',
    university: mockUniversity,
    faculty: mockFaculty,
    university_id: 'univ-1',
    faculty_id: 'fac-1',
    listings: [],
    reports: [],
    created_at: new Date('2026-01-01T00:00:00Z'),
    updated_at: new Date('2026-08-15T10:00:00Z'),
    deleted_at: null as any,
  } as User;

  const mockAdmin: User = {
    id: 'admin-123',
    email: 'admin@test.com',
    password_hash: 'hashed_password_admin',
    first_name: 'Admin',
    last_name: 'User',
    is_verified: true,
    is_banned: false,
    banned_at: null as any,
    banned_by: null as any,
    ban_reason: null as any,
    role: 'admin',
    university: mockUniversity,
    faculty: mockFaculty,
    university_id: 'univ-1',
    faculty_id: 'fac-1',
    listings: [],
    reports: [],
    created_at: new Date('2026-01-01T00:00:00Z'),
    updated_at: new Date('2026-01-01T00:00:00Z'),
    deleted_at: null as any,
  } as User;

  const mockNonBannedUser: User = {
    ...mockUser,
    id: 'user-456',
    email: 'nonbanned@test.com',
    is_banned: false,
    banned_at: null as any,
    banned_by: null as any,
    ban_reason: null as any,
  } as User;

  const mockAuditLog: AuditLog = {
    id: 'audit-1',
    entity_type: 'CASE',
    entity_id: 'case-123',
    action: 'CREATE',
    performedBy: null as any,
    performed_at: new Date(),
    notes: 'Test audit log entry',
    reason: null as any,
  } as AuditLog;

  const createPendingCase = (): Case => ({
    id: 'case-123',
    user_id: 'user-123',
    user: mockUser,
    appeal_message:
      'I believe I was banned unfairly. I was not aware that selling notes was against the platform rules.',
    status: 'pending',
    reviewed_by: null as any,
    reviewer: null as any,
    reviewed_at: null as any,
    created_at: new Date('2026-08-28T10:00:00Z'),
    updated_at: null as any,
    deleted_at: null as any,
  } as Case);

  const createReviewedCase = (
    status: 'upheld' | 'reversed',
  ): Case => ({
    ...createPendingCase(),
    status,
    reviewed_by: 'admin-123',
    reviewer: mockAdmin,
    reviewed_at: new Date('2026-08-29T10:00:00Z'),
    updated_at: new Date('2026-08-29T10:00:00Z'),
  });

  const setupReviewCase = (
    decision: 'upheld' | 'reversed',
    resultCase: Case = createReviewedCase(decision),
  ) => {
    caseRepo.findOne.mockResolvedValue(createPendingCase());

    userRepo.findOne
      .mockResolvedValueOnce(mockAdmin)
      .mockResolvedValueOnce(mockUser);

    caseRepo.save.mockResolvedValue(resultCase);

    auditLogRepo.create.mockReturnValue(mockAuditLog);
    auditLogRepo.save.mockResolvedValue(mockAuditLog);

    if (decision === 'reversed') {
      userRepo.update.mockResolvedValue({ affected: 1 } as any);
    }

    return resultCase;
  };

  const expectAuditAction = (
    action: string,
    entityType: string,
  ) => {
    expect(auditLogRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        action,
        entity_type: entityType,
        entity_id: 'case-123',
        performedBy: mockAdmin,
      }),
    );
  };

  const expectUserUnbanned = () => {
    expect(userRepo.update).toHaveBeenCalledWith(
      { id: 'user-123' },
      {
        is_banned: false,
        banned_at: null,
        banned_by: null,
        ban_reason: null,
      },
    );
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CasesService,
        {
          provide: getRepositoryToken(Case),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(AuditLog),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CasesService>(CasesService);
    caseRepo = module.get(getRepositoryToken(Case));
    userRepo = module.get(getRepositoryToken(User));
    auditLogRepo = module.get(getRepositoryToken(AuditLog));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Access Control Tests', () => {
    describe('createAppeal - Access Control', () => {
      it('should throw NotFoundException if user does not exist', async () => {
        userRepo.findOne.mockResolvedValue(null);

        const dto: CreateCaseDto = {
          appeal_message: 'Test appeal message',
        };

        await expect(
          service.createAppeal('non-existent-user', dto),
        )
          .rejects
          .toThrow(NotFoundException);

        expect(userRepo.findOne).toHaveBeenCalledWith({
          where: { id: 'non-existent-user' },
        });
      });

      it('should throw BadRequestException if user is not banned', async () => {
        userRepo.findOne.mockResolvedValue(mockNonBannedUser);

        const dto: CreateCaseDto = {
          appeal_message: 'Test appeal message',
        };

        await expect(
          service.createAppeal('user-456', dto),
        )
          .rejects
          .toThrow(BadRequestException);

        await expect(
          service.createAppeal('user-456', dto),
        )
          .rejects
          .toThrow(
            'You are not banned. Appeals are only for banned users.',
          );
      });

      it('should throw BadRequestException if user already has a pending appeal', async () => {
        userRepo.findOne.mockResolvedValue(mockUser);
        caseRepo.findOne.mockResolvedValue(createPendingCase());

        const dto: CreateCaseDto = {
          appeal_message: 'Test appeal message',
        };

        await expect(
          service.createAppeal('user-123', dto),
        )
          .rejects
          .toThrow(BadRequestException);

        await expect(
          service.createAppeal('user-123', dto),
        )
          .rejects
          .toThrow(
            'You already have a pending appeal. Please wait for it to be reviewed.',
          );
      });

      it('should allow a banned user with no pending appeal to submit', async () => {
        const mockCase = {
          ...createPendingCase(),
          appeal_message: 'I believe I was banned unfairly...',
        } as Case;

        userRepo.findOne.mockResolvedValue(mockUser);
        caseRepo.findOne.mockResolvedValue(null);
        caseRepo.create.mockReturnValue(mockCase);
        caseRepo.save.mockResolvedValue(mockCase);
        auditLogRepo.create.mockReturnValue(mockAuditLog);
        auditLogRepo.save.mockResolvedValue(mockAuditLog);

        const dto: CreateCaseDto = {
          appeal_message: 'I believe I was banned unfairly...',
        };

        const result = await service.createAppeal('user-123', dto);

        expect(result).toBeDefined();
        expect(result.user_id).toBe('user-123');
        expect(result.status).toBe('pending');
        expect(result.appeal_message).toBe(
          'I believe I was banned unfairly...',
        );

        expect(caseRepo.create).toHaveBeenCalledWith({
          user_id: 'user-123',
          appeal_message: dto.appeal_message,
          status: 'pending',
        });

        expect(caseRepo.save).toHaveBeenCalledWith(mockCase);
        expect(auditLogRepo.create).toHaveBeenCalled();
        expect(auditLogRepo.save).toHaveBeenCalledWith(mockAuditLog);
      });
    });
  });

  describe('Retrieval Tests', () => {
    describe('getUserCases', () => {
      it('should return all cases for a user', async () => {
        const mockCases = [
          {
            ...createPendingCase(),
            id: 'case-1',
            status: 'pending',
          } as Case,
          {
            ...createPendingCase(),
            id: 'case-2',
            status: 'upheld',
            reviewed_by: 'admin-123',
          } as Case,
        ];

        caseRepo.find.mockResolvedValue(mockCases);

        const result = await service.getUserCases('user-123');

        expect(result).toHaveLength(2);
        expect(result[0].id).toBe('case-1');
        expect(result[1].id).toBe('case-2');

        expect(caseRepo.find).toHaveBeenCalledWith({
          where: { user_id: 'user-123' },
          order: { created_at: 'DESC' },
        });
      });

      it('should return empty array if user has no cases', async () => {
        caseRepo.find.mockResolvedValue([]);

        const result = await service.getUserCases('user-123');

        expect(result).toHaveLength(0);
        expect(caseRepo.find).toHaveBeenCalled();
      });
    });

    describe('getCaseById', () => {
      it('should return a case if it belongs to the user', async () => {
        const mockCase = createPendingCase();

        caseRepo.findOne.mockResolvedValue(mockCase);

        const result = await service.getCaseById(
          'case-123',
          'user-123',
        );

        expect(result).toBeDefined();
        expect(result.id).toBe('case-123');
        expect(result.user_id).toBe('user-123');

        expect(caseRepo.findOne).toHaveBeenCalledWith({
          where: {
            id: 'case-123',
            user_id: 'user-123',
          },
        });
      });

      it('should throw NotFoundException if case does not exist', async () => {
        caseRepo.findOne.mockResolvedValue(null);

        await expect(
          service.getCaseById('case-123', 'user-123'),
        )
          .rejects
          .toThrow(NotFoundException);
      });

      it('should throw NotFoundException if case belongs to another user', async () => {
        caseRepo.findOne.mockResolvedValue(null);

        await expect(
          service.getCaseById('case-123', 'different-user'),
        )
          .rejects
          .toThrow(NotFoundException);
      });
    });

    describe('getPendingCases', () => {
      it('should return all pending cases ordered by oldest first', async () => {
        const pendingCases = [
          {
            ...createPendingCase(),
            id: 'case-1',
            status: 'pending',
            created_at: new Date('2026-08-01'),
          } as Case,
          {
            ...createPendingCase(),
            id: 'case-2',
            status: 'pending',
            created_at: new Date('2026-08-02'),
          } as Case,
        ];

        caseRepo.find.mockResolvedValue(pendingCases);

        const result = await service.getPendingCases();

        expect(result).toHaveLength(2);
        expect(result[0].status).toBe('pending');
        expect(result[1].status).toBe('pending');

        expect(caseRepo.find).toHaveBeenCalledWith({
          where: { status: 'pending' },
          order: { created_at: 'ASC' },
        });
      });

      it('should return empty array if no pending cases', async () => {
        caseRepo.find.mockResolvedValue([]);

        const result = await service.getPendingCases();

        expect(result).toHaveLength(0);
      });
    });
  });

  describe('Case Decision Logic & Audit Log Tests', () => {
    describe('reviewCase - Upheld Decision', () => {
      it('should uphold a ban and keep user banned with UPHOLD_BAN audit log', async () => {
        const upheldCase = setupReviewCase('upheld');

        const result = await service.reviewCase(
          'case-123',
          'admin-123',
          'upheld',
          'User clearly violated platform rules',
        );

        expect(result.status).toBe('upheld');
        expect(result.reviewed_by).toBe('admin-123');
        expect(result.reviewed_at).toBeDefined();
        expect(userRepo.update).not.toHaveBeenCalled();

        expectAuditAction('UPHOLD_BAN', 'CASE');

        expect(auditLogRepo.create).toHaveBeenCalledWith({
          entity_type: 'CASE',
          entity_id: 'case-123',
          action: 'UPHOLD_BAN',
          performedBy: mockAdmin,
          notes: expect.stringContaining('upheld'),
          reason: 'User clearly violated platform rules',
        });

        expect(auditLogRepo.save).toHaveBeenCalledWith(mockAuditLog);
        expect(upheldCase.status).toBe('upheld');
      });
    });

    describe('reviewCase - Reversed Decision (Unban)', () => {
      it('should reverse a ban and unban the user with UNBAN_USER audit log', async () => {
        setupReviewCase('reversed');

        const result = await service.reviewCase(
          'case-123',
          'admin-123',
          'reversed',
          'User showed genuine remorse and provided valid evidence',
        );

        expect(result.status).toBe('reversed');
        expect(result.reviewed_by).toBe('admin-123');

        expectUserUnbanned();
        expectAuditAction('UNBAN_USER', 'USER');

        expect(auditLogRepo.create).toHaveBeenCalledWith({
          entity_type: 'USER',
          entity_id: 'user-123',
          action: 'UNBAN_USER',
          performedBy: mockAdmin,
          notes: expect.stringContaining(
            'unbanned after appeal review',
          ),
          reason:
            'Decision: reversed. Admin notes: User showed genuine remorse and provided valid evidence',
        });

        expect(auditLogRepo.save).toHaveBeenCalledWith(mockAuditLog);
      });

      it('should handle admin notes being undefined when reversing', async () => {
        setupReviewCase('reversed');

        const result = await service.reviewCase(
          'case-123',
          'admin-123',
          'reversed',
          undefined,
        );

        expect(result.status).toBe('reversed');

        expect(auditLogRepo.create).toHaveBeenCalledWith({
          entity_type: 'USER',
          entity_id: 'user-123',
          action: 'UNBAN_USER',
          performedBy: mockAdmin,
          notes: expect.stringContaining(
            'unbanned after appeal review',
          ),
          reason:
            'Decision: reversed. Admin notes: No notes provided',
        });
      });
    });

    describe('reviewCase - Audit Log Action Verification', () => {
      it('should use UPHOLD_BAN action when decision is upheld', async () => {
        setupReviewCase('upheld');

        await service.reviewCase(
          'case-123',
          'admin-123',
          'upheld',
          'Ban upheld',
        );

        expectAuditAction('UPHOLD_BAN', 'CASE');
      });

      it('should use UNBAN_USER action when decision is reversed', async () => {
        setupReviewCase('reversed');

        await service.reviewCase(
          'case-123',
          'admin-123',
          'reversed',
          'User unbanned',
        );

        expectAuditAction('UNBAN_USER', 'USER');
      });
    });

    describe('reviewCase - Error Handling', () => {
      it('should throw NotFoundException if case does not exist', async () => {
        caseRepo.findOne.mockResolvedValue(null);

        await expect(
          service.reviewCase('invalid-case', 'admin-123', 'upheld'),
        )
          .rejects
          .toThrow(NotFoundException);
      });

      it('should throw BadRequestException if case is already reviewed', async () => {
        const upheldCase = createReviewedCase('upheld');

        caseRepo.findOne.mockResolvedValue(upheldCase);

        await expect(
          service.reviewCase('case-123', 'admin-123', 'reversed'),
        )
          .rejects
          .toThrow(BadRequestException);
      });

      it('should throw NotFoundException if admin does not exist', async () => {
        const pendingCase = createPendingCase();

        caseRepo.findOne.mockResolvedValue(pendingCase);
        userRepo.findOne.mockResolvedValue(null);

        await expect(
          service.reviewCase(
            'case-123',
            'invalid-admin',
            'upheld',
          ),
        )
          .rejects
          .toThrow(NotFoundException);
      });

      it('should throw NotFoundException if user who submitted appeal does not exist', async () => {
        const pendingCase = createPendingCase();

        caseRepo.findOne.mockResolvedValue(pendingCase);

        userRepo.findOne
          .mockResolvedValueOnce(mockAdmin)
          .mockResolvedValueOnce(null);

        await expect(
          service.reviewCase(
            'case-123',
            'admin-123',
            'reversed',
          ),
        )
          .rejects
          .toThrow(NotFoundException);
      });
    });

    describe('reviewCase - User Status After Decision', () => {
      it('should keep is_banned = true when decision is upheld', async () => {
        setupReviewCase('upheld');

        await service.reviewCase(
          'case-123',
          'admin-123',
          'upheld',
          'Ban upheld',
        );

        expect(userRepo.update).not.toHaveBeenCalled();
      });

      it('should set is_banned = false and clear ban fields when decision is reversed', async () => {
        setupReviewCase('reversed');

        await service.reviewCase(
          'case-123',
          'admin-123',
          'reversed',
          'User unbanned',
        );

        expectUserUnbanned();
      });
    });

    describe('reviewCase - Audit Log Reason Field', () => {
      it('should include admin notes in audit log reason field for upheld decision', async () => {
        setupReviewCase('upheld');

        const adminNotes =
          'User provided valid evidence of innocence';

        await service.reviewCase(
          'case-123',
          'admin-123',
          'upheld',
          adminNotes,
        );

        expect(auditLogRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            reason: adminNotes,
            performedBy: mockAdmin,
          }),
        );
      });

      it('should include admin notes in audit log reason field for reversed decision', async () => {
        setupReviewCase('reversed');

        const adminNotes = 'User was wrongly banned';

        await service.reviewCase(
          'case-123',
          'admin-123',
          'reversed',
          adminNotes,
        );

        expect(auditLogRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            reason: expect.stringContaining(adminNotes),
            performedBy: mockAdmin,
          }),
        );
      });

      it('should use default message when admin notes are not provided for upheld', async () => {
        setupReviewCase('upheld');

        await service.reviewCase(
          'case-123',
          'admin-123',
          'upheld',
          undefined,
        );

        expect(auditLogRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            reason: 'Ban upheld after appeal review',
            performedBy: mockAdmin,
          }),
        );
      });

      it('should use default message when admin notes are not provided for reversed', async () => {
        setupReviewCase('reversed');

        await service.reviewCase(
          'case-123',
          'admin-123',
          'reversed',
          undefined,
        );

        expect(auditLogRepo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            reason:
              'Decision: reversed. Admin notes: No notes provided',
            performedBy: mockAdmin,
          }),
        );
      });
    });
  });
});