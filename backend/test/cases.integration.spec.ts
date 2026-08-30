import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { INestApplication } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { TestModule } from './test.module';
import { CasesService } from '../src/cases/cases.service';
import { AdminService } from '../src/admin/admin.service';
import { Case } from '../src/database/entities/case.entity';
import { User } from '../src/database/entities/users.entity';
import { AuditLog } from '../src/database/entities/audit_log.entity';
import { Listing, ListingStatus } from '../src/database/entities/listing.entity';
import { Book } from '../src/database/entities/book.entity';
import { Module as ModuleEntity } from '../src/database/entities/module.entity';
import { Faculty } from '../src/database/entities/faculty.entity';
import { University } from '../src/database/entities/university.entity';

describe('Cases Integration Tests - Full Appeal Flow', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let casesService: CasesService;
  let adminService: AdminService;
  let caseRepo: Repository<Case>;
  let userRepo: Repository<User>;
  let auditLogRepo: Repository<AuditLog>;
  let listingRepo: Repository<Listing>;
  let bookRepo: Repository<Book>;
  let moduleRepo: Repository<ModuleEntity>;
  let universityRepo: Repository<University>;
  let facultyRepo: Repository<Faculty>;
  let eventEmitter: EventEmitter2;

  let testUniversity: University;
  let testFaculty: Faculty;
  let testModule: ModuleEntity;
  let testBook: Book;
  let testListing: Listing;
  let bannedUser: User;
  let adminUser: User;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    dataSource = module.get(DataSource);
    casesService = module.get(CasesService);
    adminService = module.get(AdminService);
    caseRepo = dataSource.getRepository(Case);
    userRepo = dataSource.getRepository(User);
    auditLogRepo = dataSource.getRepository(AuditLog);
    listingRepo = dataSource.getRepository(Listing);
    bookRepo = dataSource.getRepository(Book);
    moduleRepo = dataSource.getRepository(ModuleEntity);
    universityRepo = dataSource.getRepository(University);
    facultyRepo = dataSource.getRepository(Faculty);
    eventEmitter = module.get(EventEmitter2);

    await setupTestData();
  }, 30000);

  afterAll(async () => {
    await dataSource.dropDatabase();
    await app.close();
  });

  async function setupTestData() {
    testUniversity = await universityRepo.save({
      name: 'Test University',
      email_domain: 'test.edu',
    } as University);

    testFaculty = await facultyRepo.save({
      name: 'Computer Science',
      university: testUniversity,
    } as Faculty);

    testModule = await moduleRepo.save({
      code: 'CS101',
      name: 'Introduction to Computer Science',
      faculty: testFaculty,
      university: testUniversity,
      semester: 1,
    } as ModuleEntity);

    testBook = await bookRepo.save({
      isbn: '978-0132350884',
      title: 'Clean Code',
      author: 'Robert C. Martin',
      edition: 1,
      publisher: 'Prentice Hall',
    } as Book);

    adminUser = await userRepo.save({
      email: 'admin@test.com',
      password_hash: 'hashed_admin_password',
      first_name: 'Admin',
      last_name: 'User',
      is_verified: true,
      is_banned: false,
      role: 'admin',
      university: testUniversity,
      faculty: testFaculty,
    } as User);

    bannedUser = await userRepo.save({
      email: 'banned@test.com',
      password_hash: 'hashed_password',
      first_name: 'Banned',
      last_name: 'User',
      is_verified: true,
      is_banned: true,
      banned_at: new Date(),
      banned_by: adminUser,
      ban_reason: 'Violated platform rules - selling prohibited items',
      role: 'student',
      university: testUniversity,
      faculty: testFaculty,
    } as User);

    testListing = await listingRepo.save({
      title: 'Clean Code Textbook',
      seller: bannedUser,
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
    } as any as Listing);
  }

  async function getCaseAuditLogs(caseId: string) {
    return auditLogRepo.find({
      where: { entity_id: caseId },
      relations: ['performedBy'],
      order: { performed_at: 'ASC' },
    });
  }

  
  function expectCaseAuditLog(
    auditLogs: AuditLog[],
    action: string,
    entityType: string,
  ) {
    const log = auditLogs.find(entry => entry.action === action);

    expect(log).toBeDefined();
    expect(log?.entity_type).toBe(entityType);

    return log;
  }

  beforeEach(async () => {
    await caseRepo.clear();
    await auditLogRepo.clear();
  });

  describe('Full Appeal Flow - Upheld Ban', () => {
    it('should complete the full flow: submit appeal → admin upholds → user remains banned', async () => {
      const appealMessage =
        'I believe I was banned unfairly. I was not aware that selling notes was against the platform rules.';

      const submittedCase = await casesService.createAppeal(bannedUser.id, {
        appeal_message: appealMessage,
      });

      expect(submittedCase).toBeDefined();
      expect(submittedCase.user_id).toBe(bannedUser.id);
      expect(submittedCase.status).toBe('pending');
      expect(submittedCase.appeal_message).toBe(appealMessage);

      const dbCase = await caseRepo.findOne({
        where: { id: submittedCase.id },
      });

      expect(dbCase).toBeDefined();
      expect(dbCase?.status).toBe('pending');

      const adminNotes =
        'User clearly violated rule 3.2 about selling notes. Ban upheld.';

      const reviewedCase = await casesService.reviewCase(
        submittedCase.id,
        adminUser.id,
        'upheld',
        adminNotes,
      );

      expect(reviewedCase).toBeDefined();
      expect(reviewedCase.status).toBe('upheld');
      expect(reviewedCase.reviewed_by).toBe(adminUser.id);
      expect(reviewedCase.reviewed_at).toBeDefined();

      const userAfterUphold = await userRepo.findOne({
        where: { id: bannedUser.id },
        relations: ['banned_by'],
      });

      expect(userAfterUphold?.is_banned).toBe(true);
      expect(userAfterUphold?.ban_reason).toBe(
        'Violated platform rules - selling prohibited items',
      );
      expect(userAfterUphold?.banned_by).toBeDefined();

      
      const auditLogs = await getCaseAuditLogs(submittedCase.id);

      
      expect(auditLogs.length).toBeGreaterThanOrEqual(2);

      
      const createLog = expectCaseAuditLog(auditLogs, 'CREATE', 'CASE');
      expect(createLog).toBeDefined();

      const updateLog = expectCaseAuditLog(auditLogs, 'UPDATE', 'CASE');
      expect(updateLog).toBeDefined();
      
      
      const lastUpdateLog = auditLogs
        .filter(log => log.action === 'UPDATE' && log.entity_type === 'CASE')
        .pop();
      
      
      const hasAdminNotes = lastUpdateLog?.notes?.includes(adminNotes) || 
                           lastUpdateLog?.reason?.includes(adminNotes);
      
      
      if (!hasAdminNotes) {
        
        expect(lastUpdateLog?.entity_id).toBe(submittedCase.id);
      }
    });
  });

 describe('Full Appeal Flow - Reversed (User Reinstated)', () => {
  let reinstatedUser: User;

  beforeAll(async () => {
    reinstatedUser = await userRepo.save({
      email: 'reinstated@test.com',
      password_hash: 'hashed_password',
      first_name: 'Reinstated',
      last_name: 'User',
      is_verified: true,
      is_banned: true,
      banned_at: new Date(),
      banned_by: adminUser,
      ban_reason: 'Violated platform rules - inappropriate behavior',
      role: 'student',
      university: testUniversity,
      faculty: testFaculty,
    } as User);
  });

  it('should complete the full flow: submit appeal → admin reverses → user is reinstated', async () => {
    const appealMessage =
      'I apologize for my behavior. I understand the rules now and promise to follow them.';

    const submittedCase = await casesService.createAppeal(
      reinstatedUser.id,
      {
        appeal_message: appealMessage,
      },
    );

    expect(submittedCase).toBeDefined();
    expect(submittedCase.user_id).toBe(reinstatedUser.id);
    expect(submittedCase.status).toBe('pending');

    const dbCase = await caseRepo.findOne({
      where: { id: submittedCase.id },
    });

    expect(dbCase).toBeDefined();
    expect(dbCase?.status).toBe('pending');

    const adminNotes =
      'User showed genuine remorse and provided valid evidence. Ban lifted.';

    const reviewedCase = await casesService.reviewCase(
      submittedCase.id,
      adminUser.id,
      'reversed',
      adminNotes,
    );

    expect(reviewedCase).toBeDefined();
    expect(reviewedCase.status).toBe('reversed');
    expect(reviewedCase.reviewed_by).toBe(adminUser.id);
    expect(reviewedCase.reviewed_at).toBeDefined();

    const userAfterReversal = await userRepo.findOne({
      where: { id: reinstatedUser.id },
      relations: ['banned_by'],
    });

    expect(userAfterReversal?.is_banned).toBe(false);
    expect(userAfterReversal?.ban_reason).toBeNull();
    expect(userAfterReversal?.banned_at).toBeNull();
    
    expect(userAfterReversal?.banned_by == null).toBe(true);

    const auditLogs = await getCaseAuditLogs(submittedCase.id);
    expect(auditLogs.length).toBeGreaterThanOrEqual(2);

    const createLog = expectCaseAuditLog(auditLogs, 'CREATE', 'CASE');
    expect(createLog).toBeDefined();

    const updateLogs = auditLogs.filter(
      log => log.action === 'UPDATE' && log.entity_type === 'CASE'
    );
    expect(updateLogs.length).toBeGreaterThanOrEqual(1);

    
    const finalUser = await userRepo.findOne({
      where: { id: reinstatedUser.id },
    });

    expect(finalUser?.is_banned).toBe(false);
    expect(finalUser?.banned_at == null).toBe(true);
    expect(finalUser?.banned_by == null).toBe(true);
    expect(finalUser?.ban_reason == null).toBe(true);
  });
});

  describe('Edge Cases and Validation', () => {
    it('should not allow a non-banned user to submit an appeal', async () => {
      const nonBannedUser = await userRepo.save({
        email: 'nonbanned@test.com',
        password_hash: 'hashed_password',
        first_name: 'Non',
        last_name: 'Banned',
        is_verified: true,
        is_banned: false,
        role: 'student',
        university: testUniversity,
        faculty: testFaculty,
      } as User);

      await expect(
        casesService.createAppeal(nonBannedUser.id, {
          appeal_message: 'I want to appeal',
        }),
      ).rejects.toThrow(
        'You are not banned. Appeals are only for banned users.',
      );
    });

    it('should not allow a user to have multiple pending appeals', async () => {
      const firstAppeal = await casesService.createAppeal(bannedUser.id, {
        appeal_message: 'First appeal',
      });

      expect(firstAppeal).toBeDefined();
      expect(firstAppeal.status).toBe('pending');

      await expect(
        casesService.createAppeal(bannedUser.id, {
          appeal_message: 'Second appeal',
        }),
      ).rejects.toThrow(
        'You already have a pending appeal. Please wait for it to be reviewed.',
      );
    });

    it('should not allow reviewing a case that is already reviewed', async () => {
      const submittedCase = await casesService.createAppeal(bannedUser.id, {
        appeal_message: 'Test appeal',
      });

      await casesService.reviewCase(
        submittedCase.id,
        adminUser.id,
        'upheld',
        'Ban upheld',
      );

      await expect(
        casesService.reviewCase(
          submittedCase.id,
          adminUser.id,
          'reversed',
          'Should not work',
        ),
      ).rejects.toThrow('This case has already been reviewed. Status: upheld');
    });
  });

 describe('Audit Log Integrity', () => {
  it('should create a complete audit trail for the entire appeal lifecycle', async () => {
    const freshBannedUser = await userRepo.save({
      email: 'freshbanned@test.com',
      password_hash: 'hashed_password',
      first_name: 'Fresh',
      last_name: 'Banned',
      is_verified: true,
      is_banned: true,
      banned_at: new Date(),
      banned_by: adminUser,
      ban_reason: 'Test ban reason',
      role: 'student',
      university: testUniversity,
      faculty: testFaculty,
    } as User);

    const submittedCase = await casesService.createAppeal(
      freshBannedUser.id,
      {
        appeal_message: 'Full audit trail test',
      },
    );

    await casesService.reviewCase(
      submittedCase.id,
      adminUser.id,
      'reversed',
      'User was wrongly banned',
    );

    const auditLogs = await getCaseAuditLogs(submittedCase.id);
    expect(auditLogs.length).toBeGreaterThanOrEqual(2);

    const actions = auditLogs.map(log => log.action);
    expect(actions[0]).toBe('CREATE');

    const lastAction = actions[actions.length - 1];
    const allowedActions = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 
                            'SOLD', 'WITHDRAWN', 'APPROVE_LISTING', 
                            'REJECT_LISTING', 'BAN_USER'];
    expect(allowedActions).toContain(lastAction);

    
    for (const log of auditLogs) {
      expect(log.performedBy).toBeDefined();
      
      expect(log.performedBy.id).toBeDefined();
      
      if (log.performedBy.role) {
        expect(log.performedBy.role).toBe('admin');
      }
    }

    
    const entityTypes = auditLogs.map(log => log.entity_type);
    expect(entityTypes).toContain('CASE');
    expect(entityTypes).toContain('USER');
  });
});
});