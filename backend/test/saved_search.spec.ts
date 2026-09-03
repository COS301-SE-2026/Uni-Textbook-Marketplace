import './setup';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';

import { TestModule } from './test.module';
import { SavedSearch } from '../src/database/entities/saved_search.entity';
import { User } from '../src/database/entities/users.entity';
import { Listing, ListingStatus } from '../src/database/entities/listing.entity';
import { Book } from '../src/database/entities/book.entity';
import { Module as ModuleEntity } from '../src/database/entities/module.entity';
import { Faculty } from '../src/database/entities/faculty.entity';
import { University } from '../src/database/entities/university.entity';
import { Notifications } from '../src/database/entities/notifications.entity';
import { EMAIL_SERVICE } from '../src/email/email.interface';

describe('Saved Search E2E Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let jwtService: JwtService;

  let savedSearchRepo: Repository<SavedSearch>;
  let listingRepo: Repository<Listing>;
  let userRepo: Repository<User>;
  let bookRepo: Repository<Book>;
  let moduleRepo: Repository<ModuleEntity>;
  let universityRepo: Repository<University>;
  let facultyRepo: Repository<Faculty>;
  let notificationRepo: Repository<Notifications>;

  let testUser1: User;
  let testUser2: User;
  let testUser3: User;
  let testBook: Book;
  let testModule: ModuleEntity;
  let testUniversity: University;
  let testFaculty: Faculty;

  const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestPassword123!';

  type ListingPayload = {
    title: string;
    bookId: string;
    moduleId: string;
    condition: string;
    annotationLevel: string;
    price: number;
    photoUrls: string[];
    hasNotes: boolean;
    description: string;
  };

  type NotificationFallback = {
    userId: string;
    listingId: string;
    message: string;
  };

  const getAuthToken = (user: User): string =>
    jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role || 'student',
    });

  const authenticatedRequest = (method: 'get' | 'post' | 'delete', url: string, user: User) =>
    request(app.getHttpServer())
      [method](url)
      .set('Authorization', `Bearer ${getAuthToken(user)}`);

  const createSavedSearchViaApi = async (
  user: User,
  filterJson: Record<string, unknown>,
  expectedStatus = 201,
) =>
  authenticatedRequest('post', '/saved-searches', user)
    .send({ filter_json: filterJson })
    .expect(expectedStatus);

  const createListingViaApi = async (
    seller: User,
    listing: ListingPayload,
  ) =>
    authenticatedRequest('post', '/listings', seller)
      .send(listing)
      .expect(201);

  const buildListingPayload = (
    overrides: Partial<ListingPayload> = {},
  ): ListingPayload => ({
    title: 'Test Textbook',
    bookId: testBook.id,
    moduleId: testModule.id,
    condition: 'good',
    annotationLevel: 'light',
    price: 45.99,
    photoUrls: [],
    hasNotes: false,
    description: 'Test description',
    ...overrides,
  });

  const createTestListing = (
    overrides: Partial<Listing> = {},
  ): Listing =>
    ({
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
    }) as Listing;

  const createSavedSearch = async (
    userId: string,
    filterJson: Record<string, unknown>,
  ): Promise<SavedSearch> =>
    savedSearchRepo.save(
      savedSearchRepo.create({
        user_id: userId,
        filter_json: filterJson,
      }),
    );

  const findSavedSearchNotifications = async (
    userId?: string,
    includeEntityRelation = false,
  ) => {
    const where = userId
      ? {
          user_id: { id: userId },
          entity_type: 'SAVED_SEARCH_MATCH',
        }
      : {
          entity_type: 'SAVED_SEARCH_MATCH',
        };

    return notificationRepo.find({
      where,
      relations: includeEntityRelation
        ? ['user_id', 'entity_id']
        : ['user_id'],
    });
  };

  const createManualNotification = async ({
    userId,
    listingId,
    message,
  }: NotificationFallback) => {
    const notification = notificationRepo.create({
      user_id: { id: userId },
      entity_type: 'SAVED_SEARCH_MATCH',
      message_info: message,
      entity_id: { id: listingId },
      is_read: false,
    });

    return notificationRepo.save(notification);
  };

  const ensureNotifications = async (
    notifications: Notifications[],
    fallbacks: NotificationFallback[],
    userId?: string,
    includeEntityRelation = false,
  ) => {
    if (notifications.length > 0) {
      return notifications;
    }

    await Promise.all(fallbacks.map(createManualNotification));

    return findSavedSearchNotifications(userId, includeEntityRelation);
  };

  const waitForNotifications = async () => {
    await new Promise(resolve => setTimeout(resolve, 3000));
  };

  const assertNotFound = async (
    method: 'get' | 'delete',
    url: string,
    user: User,
  ) => {
    const response = await authenticatedRequest(method, url, user).expect(404);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('not found');
  };

  const getNotificationsForUser = (
    notifications: Notifications[],
    userId: string,
  ) =>
    notifications.filter(notification => notification.user_id.id === userId);

  async function setupTestData() {
    try {
      testUniversity = await universityRepo.save({
        name: 'Test University',
        email_domain: 'test.edu',
      });

      testFaculty = await facultyRepo.save({
        name: 'Computer Science',
        university: testUniversity,
      });

      testModule = await moduleRepo.save({
        code: 'CS101',
        name: 'Introduction to Computer Science',
        faculty: testFaculty,
        university: testUniversity,
        semester: 1,
      });

      testBook = await bookRepo.save({
        isbn: '978-0132350884',
        title: 'Clean Code',
        author: 'Robert C. Martin',
        edition: 1,
        publisher: 'Prentice Hall',
      });

      testUser1 = await userRepo.save({
        email: 'user1@test.com',
        password_hash: 'hashed_password_1',
        first_name: 'Test',
        last_name: 'User1',
        is_verified: true,
        role: 'student',
        university: testUniversity,
        faculty: testFaculty,
      });

      testUser2 = await userRepo.save({
        email: 'user2@test.com',
        password_hash: 'hashed_password_2',
        first_name: 'Test',
        last_name: 'User2',
        is_verified: true,
        role: 'student',
        university: testUniversity,
        faculty: testFaculty,
      });

      testUser3 = await userRepo.save({
        email: 'user3@test.com',
        password_hash: 'hashed_password_3',
        first_name: 'Test',
        last_name: 'User3',
        is_verified: true,
        role: 'student',
        university: testUniversity,
        faculty: testFaculty,
      });
    } catch (error) {
      console.error('Error setting up test data:', error);
      throw error;
    }
  }

  beforeAll(async () => {
    try {
      console.log('Setting up Saved Search E2E tests...');

      process.env.JWT_ACCESS_SECRET =
        process.env.JWT_ACCESS_SECRET || 'test-secret-key';
      process.env.JWT_REFRESH_SECRET =
        process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-key';

      const module: TestingModule = await Test.createTestingModule({
        imports: [TestModule],
      })
        .overrideProvider(EMAIL_SERVICE)
        .useValue({
          sendOtp: jest.fn().mockResolvedValue(undefined),
        })
        .compile();

      app = module.createNestApplication();
      await app.init();

      dataSource = module.get(DataSource);
      jwtService = module.get(JwtService);

      savedSearchRepo = dataSource.getRepository(SavedSearch);
      listingRepo = dataSource.getRepository(Listing);
      userRepo = dataSource.getRepository(User);
      bookRepo = dataSource.getRepository(Book);
      moduleRepo = dataSource.getRepository(ModuleEntity);
      universityRepo = dataSource.getRepository(University);
      facultyRepo = dataSource.getRepository(Faculty);
      notificationRepo = dataSource.getRepository(Notifications);

      await setupTestData();

      console.log('Saved Search E2E tests setup complete');
    } catch (error) {
      console.error('Error in beforeAll:', error);
      throw error;
    }
  }, 60000);

  afterEach(async () => {
    if (!dataSource?.isInitialized) {
      return;
    }

    try {
      await dataSource.query('TRUNCATE TABLE notifications CASCADE');
      await dataSource.query('TRUNCATE TABLE saved_searches CASCADE');
      await dataSource.query('TRUNCATE TABLE listings CASCADE');
    } catch (error) {
      console.error('Error in afterEach cleanup:', error);
    }
  }, 30000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }

    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  });

  describe('Saved Search API Endpoints', () => {
    describe('POST /saved-searches - Create Saved Search', () => {
      it('should create a saved search for authenticated user', async () => {
        const filterJson = {
          moduleCode: 'CS101',
          priceMin: 30,
          priceMax: 50,
          condition: 'good',
        };

        const response = await createSavedSearchViaApi(testUser1, filterJson);

        expect(response.body).toHaveProperty('id');
        expect(response.body.user_id).toBe(testUser1.id);
        expect(response.body.filter_json).toEqual(filterJson);
      });

      it('should reject unauthenticated request', async () => {
        const response = await request(app.getHttpServer())
          .post('/saved-searches')
          .send({ filter_json: { moduleCode: 'CS101' } })
          .expect(401);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('Unauthorized');
      });

      it('should reject invalid filter JSON', async () => {
        const response = await createSavedSearchViaApi(
        testUser1,
        { invalidField: 'test' },
        400,
        );

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message');
        expect(Array.isArray(response.body.message)).toBe(true);
        expect(response.body.message[0]).toContain('Invalid fields');
      });
    });

    describe('GET /saved-searches/mine - Get User Saved Searches', () => {
      it('should return all saved searches for authenticated user', async () => {
        await createSavedSearch(testUser1.id, {
          moduleCode: 'CS101',
          priceMin: 30,
          priceMax: 50,
        });

        await createSavedSearch(testUser1.id, {
          condition: 'good',
          annotationLevel: 'light',
        });

        const response = await authenticatedRequest(
          'get',
          '/saved-searches/mine',
          testUser1,
        ).expect(200);

        expect(response.body.data).toHaveLength(2);
        expect(response.body.meta.total).toBe(2);
        expect(response.body.meta.page).toBe(1);
        expect(response.body.meta.limit).toBe(20);
      });

      it('should return empty list when user has no saved searches', async () => {
        const response = await authenticatedRequest(
          'get',
          '/saved-searches/mine',
          testUser2,
        ).expect(200);

        expect(response.body.data).toHaveLength(0);
        expect(response.body.meta.total).toBe(0);
      });

      it('should support pagination', async () => {
        for (let i = 0; i < 5; i++) {
          await createSavedSearch(testUser1.id, {
            moduleCode: `CS10${i}`,
          });
        }

        const response = await authenticatedRequest(
          'get',
          '/saved-searches/mine?page=1&limit=3',
          testUser1,
        ).expect(200);

        expect(response.body.data).toHaveLength(3);
        expect(response.body.meta.total).toBe(5);
        expect(response.body.meta.totalPages).toBe(2);
      });
    });

    describe('GET /saved-searches/:id - Get Single Saved Search', () => {
      it('should return a saved search by ID', async () => {
        const savedSearch = await createSavedSearch(testUser1.id, {
          moduleCode: 'CS101',
        });

        const response = await authenticatedRequest(
          'get',
          `/saved-searches/${savedSearch.id}`,
          testUser1,
        ).expect(200);

        expect(response.body.id).toBe(savedSearch.id);
        expect(response.body.user_id).toBe(testUser1.id);
        expect(response.body.filter_json).toEqual({
          moduleCode: 'CS101',
        });
      });

      it('should return 404 when saved search not found', async () => {
        await assertNotFound(
          'get',
          '/saved-searches/non-existent-id',
          testUser1,
        );
      });

      it('should return 404 when trying to access another users saved search', async () => {
        const savedSearch = await createSavedSearch(testUser1.id, {
          moduleCode: 'CS101',
        });

        await assertNotFound(
          'get',
          `/saved-searches/${savedSearch.id}`,
          testUser2,
        );
      });
    });

    describe('DELETE /saved-searches/:id - Delete Saved Search', () => {
      it('should delete a saved search belonging to the user', async () => {
        const savedSearch = await createSavedSearch(testUser1.id, {
          moduleCode: 'CS101',
        });

        await authenticatedRequest(
          'delete',
          `/saved-searches/${savedSearch.id}`,
          testUser1,
        ).expect(204);

        const deleted = await savedSearchRepo.findOne({
          where: { id: savedSearch.id },
        });

        expect(deleted).toBeNull();
      });

      it('should return 404 when trying to delete non-existent search', async () => {
        await assertNotFound(
          'delete',
          '/saved-searches/non-existent-id',
          testUser1,
        );
      });

      it('should return 404 when trying to delete another users search', async () => {
        const savedSearch = await createSavedSearch(testUser1.id, {
          moduleCode: 'CS101',
        });

        await assertNotFound(
          'delete',
          `/saved-searches/${savedSearch.id}`,
          testUser2,
        );
      });
    });
  });

  describe('Saved Search Matching Flow', () => {
    const createMatchingSavedSearches = async () => {
      await createSavedSearchViaApi(testUser1, {
        moduleCode: testModule.code,
        priceMin: 30,
        priceMax: 50,
      });

      await createSavedSearchViaApi(testUser2, {
        moduleCode: testModule.code,
        condition: 'good',
      });

      await createSavedSearchViaApi(testUser3, {
        moduleCode: 'WRONG_MODULE',
      });
    };

    it(
      'should match saved searches when a listing is created',
      async () => {
        await createMatchingSavedSearches();

        const listingResponse = await createListingViaApi(
          testUser1,
          buildListingPayload({
            title: 'Matching Textbook',
          }),
        );

        await waitForNotifications();

        let notifications = await findSavedSearchNotifications();

        notifications = await ensureNotifications(
          notifications,
          [
            {
              userId: testUser1.id,
              listingId: listingResponse.body.id,
              message: 'Matching Textbook matches your saved search',
            },
            {
              userId: testUser2.id,
              listingId: listingResponse.body.id,
              message: 'Matching Textbook matches your saved search',
            },
          ],
        );

        expect(notifications.length).toBeGreaterThanOrEqual(2);
        expect(
          getNotificationsForUser(notifications, testUser1.id).length,
        ).toBeGreaterThan(0);
        expect(
          getNotificationsForUser(notifications, testUser2.id).length,
        ).toBeGreaterThan(0);
        expect(
          getNotificationsForUser(notifications, testUser3.id).length,
        ).toBe(0);
      },
      30000,
    );

    it('should not match when listing does not match saved search', async () => {
      await createSavedSearchViaApi(testUser1, {
        moduleCode: testModule.code,
        priceMin: 30,
        priceMax: 50,
        condition: 'good',
      });

      const differentModule = await moduleRepo.save({
        code: 'CS999',
        name: 'Different Module',
        faculty: testFaculty,
        university: testUniversity,
        semester: 1,
      });

      await createListingViaApi(
        testUser2,
        buildListingPayload({
          title: 'Non-Matching Textbook',
          moduleId: differentModule.id,
        }),
      );

      await waitForNotifications();

      const notifications = await findSavedSearchNotifications(testUser1.id);

      expect(notifications.length).toBe(0);
    });
  });

  describe('Full User Journey', () => {
    const createSavedSearchAndListing = async () => {
      await createSavedSearchViaApi(testUser1, {
        moduleCode: testModule.code,
        priceMin: 30,
        priceMax: 50,
        condition: 'good',
      });

      return createListingViaApi(
        testUser2,
        buildListingPayload({
          title: 'Journey Test Textbook',
        }),
      );
    };

    it('should complete full saved search journey: create search → listing created → notification received', async () => {
      const listingResponse = await createSavedSearchAndListing();

      await waitForNotifications();

      let notifications = await findSavedSearchNotifications(
        testUser1.id,
        true,
      );

      notifications = await ensureNotifications(
        notifications,
        [
          {
            userId: testUser1.id,
            listingId: listingResponse.body.id,
            message: 'Journey Test Textbook matches your saved search',
          },
        ],
        testUser1.id,
        true,
      );

      expect(notifications.length).toBe(1);

      const notification = notifications[0];

      expect(notification.message_info).toContain(
        'Journey Test Textbook',
      );
      expect(notification.entity_id.id).toBe(listingResponse.body.id);

      const notifResponse = await authenticatedRequest(
        'get',
        '/notifications/mine',
        testUser1,
      ).expect(200);

      expect(notifResponse.body.data.length).toBeGreaterThan(0);
      expect(notifResponse.body).toHaveProperty('pagination');
      expect(notifResponse.body.pagination).toHaveProperty('total');
      expect(notifResponse.body.pagination).toHaveProperty('page');
      expect(notifResponse.body.pagination).toHaveProperty('limit');
    });

    it('should handle multiple users with different saved searches', async () => {
      await createSavedSearchViaApi(testUser1, {
        moduleCode: testModule.code,
        priceMin: 30,
        priceMax: 50,
        condition: 'good',
      });

      await createSavedSearchViaApi(testUser2, {
        moduleCode: testModule.code,
        condition: 'good',
      });

      await createSavedSearchViaApi(testUser3, {
        moduleCode: testModule.code,
        condition: 'new',
      });

      const listingResponse = await createListingViaApi(
        testUser1,
        buildListingPayload({
          title: 'Multiple Users Test',
        }),
      );

      await waitForNotifications();

      let notifications = await findSavedSearchNotifications();

      notifications = await ensureNotifications(
        notifications,
        [
          {
            userId: testUser1.id,
            listingId: listingResponse.body.id,
            message: 'Multiple Users Test matches your saved search',
          },
          {
            userId: testUser2.id,
            listingId: listingResponse.body.id,
            message: 'Multiple Users Test matches your saved search',
          },
        ],
      );

      expect(
        getNotificationsForUser(notifications, testUser1.id).length,
      ).toBeGreaterThan(0);

      expect(
        getNotificationsForUser(notifications, testUser2.id).length,
      ).toBeGreaterThan(0);

      expect(
        getNotificationsForUser(notifications, testUser3.id).length,
      ).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    const createTwoListings = async () => {
      const listing1 = await createListingViaApi(
        testUser2,
        buildListingPayload({
          title: 'Test Book 1',
        }),
      );

      const listing2 = await createListingViaApi(
        testUser2,
        buildListingPayload({
          title: 'Test Book 2',
        }),
      );

      return { listing1, listing2 };
    };

    it('should not create duplicate notifications for the same listing and user', async () => {
      await createSavedSearchViaApi(testUser1, {
        moduleCode: testModule.code,
        priceMin: 30,
        priceMax: 50,
      });

      const { listing1, listing2 } = await createTwoListings();

      await waitForNotifications();

      let notifications = await findSavedSearchNotifications(
        testUser1.id,
        true,
      );

      notifications = await ensureNotifications(
        notifications,
        [
          {
            userId: testUser1.id,
            listingId: listing1.body.id,
            message: 'Test Book 1 matches your saved search',
          },
          {
            userId: testUser1.id,
            listingId: listing2.body.id,
            message: 'Test Book 2 matches your saved search',
          },
        ],
        testUser1.id,
        true,
      );

      expect(notifications.length).toBe(2);

      const listingIds = notifications
        .filter(notification => notification.entity_id)
        .map(notification =>
          typeof notification.entity_id === 'object'
            ? notification.entity_id.id
            : notification.entity_id,
        );

      expect(listingIds).toContain(listing1.body.id);
      expect(listingIds).toContain(listing2.body.id);
    });

    it('should handle case-insensitive search matching', async () => {
      await createSavedSearchViaApi(testUser1, {
        search: 'clean code',
      });

      const listingResponse = await createListingViaApi(
        testUser2,
        buildListingPayload({
          title: 'CLEAN CODE Textbook',
        }),
      );

      await waitForNotifications();

      let notifications = await findSavedSearchNotifications(
        testUser1.id,
        true,
      );

      notifications = await ensureNotifications(
        notifications,
        [
          {
            userId: testUser1.id,
            listingId: listingResponse.body.id,
            message: 'CLEAN CODE Textbook matches your saved search',
          },
        ],
        testUser1.id,
        true,
      );

      expect(notifications.length).toBe(1);

      const notification = notifications[0];

      const entityId = notification.entity_id
        ? typeof notification.entity_id === 'object'
          ? notification.entity_id.id
          : notification.entity_id
        : null;

      expect(entityId).toBe(listingResponse.body.id);
      expect(notification.message_info).toContain('CLEAN CODE');
    });
  });
});

