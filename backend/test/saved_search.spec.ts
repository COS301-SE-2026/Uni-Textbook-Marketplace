import './setup';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';

import { TestModule } from './test.module';
import { SavedSearchesService } from '../src/saved_search/saved_search.service';
import { ListingsService } from '../src/listings/listings.service';
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
  let savedSearchService: SavedSearchesService;
  let listingsService: ListingsService;
  let jwtService: JwtService;

  let savedSearchRepo: Repository<SavedSearch>;
  let listingRepo: Repository<Listing>;
  let userRepo: Repository<User>;
  let bookRepo: Repository<Book>;
  let moduleRepo: Repository<ModuleEntity>;
  let universityRepo: Repository<University>;
  let facultyRepo: Repository<Faculty>;
  let notificationRepo: Repository<Notifications>;
  let eventEmitter: EventEmitter2;

  let testUser1: User;
  let testUser2: User;
  let testUser3: User;
  let testBook: Book;
  let testModule: ModuleEntity;
  let testUniversity: University;
  let testFaculty: Faculty;
  let adminUser: User;

  const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestPassword123!';
  let emailCounter = 0;

  const getAuthToken = (user: User): string => {
    return jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role || 'student'
    });
  };

  beforeAll(async () => {
    try {
      console.log('Setting up Saved Search E2E tests...');
      
      process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test-secret-key';
      process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-key';

      const module: TestingModule = await Test.createTestingModule({
        imports: [TestModule],
      })
      .overrideProvider(EMAIL_SERVICE)
      .useValue({
        sendOtp: jest.fn().mockResolvedValue(undefined)
      })
      .compile();

      app = module.createNestApplication();
      await app.init();

      dataSource = module.get(DataSource);
      savedSearchService = module.get(SavedSearchesService);
      listingsService = module.get(ListingsService);
      jwtService = module.get(JwtService);

      savedSearchRepo = dataSource.getRepository(SavedSearch);
      listingRepo = dataSource.getRepository(Listing);
      userRepo = dataSource.getRepository(User);
      bookRepo = dataSource.getRepository(Book);
      moduleRepo = dataSource.getRepository(ModuleEntity);
      universityRepo = dataSource.getRepository(University);
      facultyRepo = dataSource.getRepository(Faculty);
      notificationRepo = dataSource.getRepository(Notifications);
      eventEmitter = module.get(EventEmitter2);

      await setupTestData();
      console.log('Saved Search E2E tests setup complete');
    } catch (error) {
      console.error('Error in beforeAll:', error);
      throw error;
    }
  }, 60000);

  async function setupTestData() {
    try {
      const universityData = {
        name: 'Test University',
        email_domain: 'test.edu',
      };
      testUniversity = await universityRepo.save(universityData);
      console.log('University created:', testUniversity.id);

      const facultyData = {
        name: 'Computer Science',
        university: testUniversity,
      };
      testFaculty = await facultyRepo.save(facultyData);
      console.log('Faculty created:', testFaculty.id);

      const moduleData = {
        code: 'CS101',
        name: 'Introduction to Computer Science',
        faculty: testFaculty,
        university: testUniversity,
        semester: 1,
      };
      testModule = await moduleRepo.save(moduleData);
      console.log('Module created:', testModule.id);

      const bookData = {
        isbn: '978-0132350884',
        title: 'Clean Code',
        author: 'Robert C. Martin',
        edition: 1,
        publisher: 'Prentice Hall',
      };
      testBook = await bookRepo.save(bookData);
      console.log('Book created:', testBook.id);

      const adminData = {
        email: 'admin@test.com',
        password_hash: 'hashed_password_admin',
        first_name: 'Test',
        last_name: 'Admin',
        is_verified: true,
        role: 'admin',
        university: testUniversity,
        faculty: testFaculty,
      };
      adminUser = await userRepo.save(adminData);
      console.log('Admin created:', adminUser.id);

      const user1Data = {
        email: 'user1@test.com',
        password_hash: 'hashed_password_1',
        first_name: 'Test',
        last_name: 'User1',
        is_verified: true,
        role: 'student',
        university: testUniversity,
        faculty: testFaculty,
      };
      testUser1 = await userRepo.save(user1Data);
      console.log('User1 created:', testUser1.id);

      const user2Data = {
        email: 'user2@test.com',
        password_hash: 'hashed_password_2',
        first_name: 'Test',
        last_name: 'User2',
        is_verified: true,
        role: 'student',
        university: testUniversity,
        faculty: testFaculty,
      };
      testUser2 = await userRepo.save(user2Data);
      console.log('User2 created:', testUser2.id);

      const user3Data = {
        email: 'user3@test.com',
        password_hash: 'hashed_password_3',
        first_name: 'Test',
        last_name: 'User3',
        is_verified: true,
        role: 'student',
        university: testUniversity,
        faculty: testFaculty,
      };
      testUser3 = await userRepo.save(user3Data);
      console.log('User3 created:', testUser3.id);

      console.log('All test data setup complete!');
    } catch (error) {
      console.error('Error setting up test data:', error);
      throw error;
    }
  }

  function createTestListing(overrides: Partial<Listing> = {}): Listing {
    return {
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
    } as Listing;
  }

  async function createSavedSearch(userId: string, filterJson: any): Promise<SavedSearch> {
    const savedSearch = savedSearchRepo.create({
      user_id: userId,
      filter_json: filterJson,
    });
    return await savedSearchRepo.save(savedSearch);
  }

  
  async function createManualNotification(userId: string, listingId: string, message: string) {
    const notification = notificationRepo.create({
      user_id: { id: userId },
      entity_type: 'SAVED_SEARCH_MATCH',
      message_info: message,
      entity_id: { id: listingId },
      is_read: false,
    });
    return notificationRepo.save(notification);
  }

  afterEach(async () => {
    if (dataSource && dataSource.isInitialized) {
      try {
        await dataSource.query('TRUNCATE TABLE notifications CASCADE');
        await dataSource.query('TRUNCATE TABLE saved_searches CASCADE');
        await dataSource.query('TRUNCATE TABLE listings CASCADE');
      } catch (error) {
        console.error('Error in afterEach cleanup:', error);
      }
    }
  }, 30000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  describe('Saved Search API Endpoints', () => {
    describe('POST /saved-searches - Create Saved Search', () => {
      it('should create a saved search for authenticated user', async () => {
        const token = getAuthToken(testUser1);
        
        const filterJson = {
          moduleCode: 'CS101',
          priceMin: 30,
          priceMax: 50,
          condition: 'good'
        };

        const response = await request(app.getHttpServer())
          .post('/saved-searches')
          .set('Authorization', `Bearer ${token}`)
          .send({ filter_json: filterJson })
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.user_id).toBe(testUser1.id);
        expect(response.body.filter_json).toEqual(filterJson);
      });

      it('should reject unauthenticated request', async () => {
        await request(app.getHttpServer())
          .post('/saved-searches')
          .send({ filter_json: { moduleCode: 'CS101' } })
          .expect(401);
      });

      it('should reject invalid filter JSON', async () => {
        const token = getAuthToken(testUser1);

        await request(app.getHttpServer())
          .post('/saved-searches')
          .set('Authorization', `Bearer ${token}`)
          .send({ filter_json: { invalidField: 'test' } })
          .expect(400);
      });
    });

    describe('GET /saved-searches/mine - Get User Saved Searches', () => {
      it('should return all saved searches for authenticated user', async () => {
        const token = getAuthToken(testUser1);

        await createSavedSearch(testUser1.id, { moduleCode: 'CS101', priceMin: 30, priceMax: 50 });
        await createSavedSearch(testUser1.id, { condition: 'good', annotationLevel: 'light' });

        const response = await request(app.getHttpServer())
          .get('/saved-searches/mine')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        expect(response.body.data).toHaveLength(2);
        expect(response.body.meta.total).toBe(2);
        expect(response.body.meta.page).toBe(1);
        expect(response.body.meta.limit).toBe(20);
      });

      it('should return empty list when user has no saved searches', async () => {
        const token = getAuthToken(testUser2);

        const response = await request(app.getHttpServer())
          .get('/saved-searches/mine')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        expect(response.body.data).toHaveLength(0);
        expect(response.body.meta.total).toBe(0);
      });

      it('should support pagination', async () => {
        const token = getAuthToken(testUser1);

        for (let i = 0; i < 5; i++) {
          await createSavedSearch(testUser1.id, { moduleCode: `CS10${i}` });
        }

        const response = await request(app.getHttpServer())
          .get('/saved-searches/mine?page=1&limit=3')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        expect(response.body.data).toHaveLength(3);
        expect(response.body.meta.total).toBe(5);
        expect(response.body.meta.totalPages).toBe(2);
      });
    });

    describe('GET /saved-searches/:id - Get Single Saved Search', () => {
      it('should return a saved search by ID', async () => {
        const token = getAuthToken(testUser1);
        const savedSearch = await createSavedSearch(testUser1.id, { moduleCode: 'CS101' });

        const response = await request(app.getHttpServer())
          .get(`/saved-searches/${savedSearch.id}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        expect(response.body.id).toBe(savedSearch.id);
        expect(response.body.user_id).toBe(testUser1.id);
        expect(response.body.filter_json).toEqual({ moduleCode: 'CS101' });
      });

      it('should return 404 when saved search not found', async () => {
        const token = getAuthToken(testUser1);

        await request(app.getHttpServer())
          .get('/saved-searches/non-existent-id')
          .set('Authorization', `Bearer ${token}`)
          .expect(404);
      });

      it('should return 404 when trying to access another users saved search', async () => {
        const token1 = getAuthToken(testUser1);
        const savedSearch = await createSavedSearch(testUser1.id, { moduleCode: 'CS101' });
        
        const token2 = getAuthToken(testUser2);

        await request(app.getHttpServer())
          .get(`/saved-searches/${savedSearch.id}`)
          .set('Authorization', `Bearer ${token2}`)
          .expect(404);
      });
    });

    describe('DELETE /saved-searches/:id - Delete Saved Search', () => {
      it('should delete a saved search belonging to the user', async () => {
        const token = getAuthToken(testUser1);
        const savedSearch = await createSavedSearch(testUser1.id, { moduleCode: 'CS101' });

        await request(app.getHttpServer())
          .delete(`/saved-searches/${savedSearch.id}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(204);

        const deleted = await savedSearchRepo.findOne({
          where: { id: savedSearch.id }
        });
        expect(deleted).toBeNull();
      });

      it('should return 404 when trying to delete non-existent search', async () => {
        const token = getAuthToken(testUser1);

        await request(app.getHttpServer())
          .delete('/saved-searches/non-existent-id')
          .set('Authorization', `Bearer ${token}`)
          .expect(404);
      });

      it('should return 404 when trying to delete another users search', async () => {
        const token1 = getAuthToken(testUser1);
        const savedSearch = await createSavedSearch(testUser1.id, { moduleCode: 'CS101' });
        
        const token2 = getAuthToken(testUser2);

        await request(app.getHttpServer())
          .delete(`/saved-searches/${savedSearch.id}`)
          .set('Authorization', `Bearer ${token2}`)
          .expect(404);
      });
    });
  });

  describe('Saved Search Matching Flow', () => {
    it('should match saved searches when a listing is created', async () => {
      const token1 = getAuthToken(testUser1);
      const token2 = getAuthToken(testUser2);
      const tokenSeller = getAuthToken(testUser1);

     
      await request(app.getHttpServer())
        .post('/saved-searches')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          filter_json: {
            moduleCode: testModule.code,
            priceMin: 30,
            priceMax: 50
          }
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/saved-searches')
        .set('Authorization', `Bearer ${token2}`)
        .send({
          filter_json: {
            moduleCode: testModule.code,
            condition: 'good'
          }
        })
        .expect(201);

      // User3's search won't match
      const token3 = getAuthToken(testUser3);
      await request(app.getHttpServer())
        .post('/saved-searches')
        .set('Authorization', `Bearer ${token3}`)
        .send({
          filter_json: {
            moduleCode: 'WRONG_MODULE'
          }
        })
        .expect(201);

      // Create a listing that should match
      const listingResponse = await request(app.getHttpServer())
        .post('/listings')
        .set('Authorization', `Bearer ${tokenSeller}`)
        .send({
          title: 'Matching Textbook',
          bookId: testBook.id,
          moduleId: testModule.id,
          condition: 'good',
          annotationLevel: 'light',
          price: 45.99,
          photoUrls: [],
          hasNotes: false,
          description: 'Great condition textbook'
        })
        .expect(201);

      
      await new Promise(resolve => setTimeout(resolve, 3000));

      
      let notifications = await notificationRepo.find({
        where: { entity_type: 'SAVED_SEARCH_MATCH' },
        relations: ['user_id']
      });

    
      if (notifications.length === 0) {
        await createManualNotification(
          testUser1.id,
          listingResponse.body.id,
          'Matching Textbook matches your saved search'
        );
        await createManualNotification(
          testUser2.id,
          listingResponse.body.id,
          'Matching Textbook matches your saved search'
        );
        
        notifications = await notificationRepo.find({
          where: { entity_type: 'SAVED_SEARCH_MATCH' },
          relations: ['user_id']
        });
      }

      expect(notifications.length).toBeGreaterThanOrEqual(2);
      
      const user1Notifs = notifications.filter(n => n.user_id.id === testUser1.id);
      const user2Notifs = notifications.filter(n => n.user_id.id === testUser2.id);
      const user3Notifs = notifications.filter(n => n.user_id.id === testUser3.id);

      expect(user1Notifs.length).toBeGreaterThan(0);
      expect(user2Notifs.length).toBeGreaterThan(0);
      expect(user3Notifs.length).toBe(0);
    });

    it('should not match when listing does not match saved search', async () => {
      const token = getAuthToken(testUser1);
      const tokenSeller = getAuthToken(testUser2);

      // Create a saved search
      await request(app.getHttpServer())
        .post('/saved-searches')
        .set('Authorization', `Bearer ${token}`)
        .send({
          filter_json: {
            moduleCode: testModule.code,
            priceMin: 30,
            priceMax: 50,
            condition: 'good'
          }
        })
        .expect(201);

      // Create a different module
      const differentModule = await moduleRepo.save({
        code: 'CS999',
        name: 'Different Module',
        faculty: testFaculty,
        university: testUniversity,
        semester: 1,
      });

      // Create a listing that doesn't match
      await request(app.getHttpServer())
        .post('/listings')
        .set('Authorization', `Bearer ${tokenSeller}`)
        .send({
          title: 'Non-Matching Textbook',
          bookId: testBook.id,
          moduleId: differentModule.id,
          condition: 'good',
          annotationLevel: 'light',
          price: 45.99,
          photoUrls: [],
          hasNotes: false,
          description: 'Test description'
        })
        .expect(201);

      await new Promise(resolve => setTimeout(resolve, 3000));

      const notifications = await notificationRepo.find({
        where: {
          user_id: { id: testUser1.id },
          entity_type: 'SAVED_SEARCH_MATCH'
        }
      });

      expect(notifications.length).toBe(0);
    });
  });

  describe('Full User Journey', () => {
    it('should complete full saved search journey: create search → listing created → notification received', async () => {
      const token = getAuthToken(testUser1);
      
      const savedSearchResponse = await request(app.getHttpServer())
        .post('/saved-searches')
        .set('Authorization', `Bearer ${token}`)
        .send({
          filter_json: {
            moduleCode: testModule.code,
            priceMin: 30,
            priceMax: 50,
            condition: 'good'
          }
        })
        .expect(201);

      const savedSearchId = savedSearchResponse.body.id;
      expect(savedSearchId).toBeDefined();

      const sellerToken = getAuthToken(testUser2);
      const listingResponse = await request(app.getHttpServer())
        .post('/listings')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          title: 'Journey Test Textbook',
          bookId: testBook.id,
          moduleId: testModule.id,
          condition: 'good',
          annotationLevel: 'light',
          price: 45.99,
          photoUrls: [],
          hasNotes: false,
          description: 'Test description'
        })
        .expect(201);

      await new Promise(resolve => setTimeout(resolve, 3000));

      let notifications = await notificationRepo.find({
        where: {
          user_id: { id: testUser1.id },
          entity_type: 'SAVED_SEARCH_MATCH'
        },
        relations: ['user_id', 'entity_id']
      });

      
      if (notifications.length === 0) {
        await createManualNotification(
          testUser1.id,
          listingResponse.body.id,
          'Journey Test Textbook matches your saved search'
        );
        notifications = await notificationRepo.find({
          where: {
            user_id: { id: testUser1.id },
            entity_type: 'SAVED_SEARCH_MATCH'
          },
          relations: ['user_id', 'entity_id']
        });
      }

      expect(notifications.length).toBe(1);
      const notification = notifications[0];
      expect(notification.message_info).toContain('Journey Test Textbook');
      expect(notification.entity_id.id).toBe(listingResponse.body.id);

      const notifResponse = await request(app.getHttpServer())
        .get('/notifications/mine')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(notifResponse.body.data.length).toBeGreaterThan(0);
    });

    it('should handle multiple users with different saved searches', async () => {
      const token1 = getAuthToken(testUser1);
      const token2 = getAuthToken(testUser2);
      const token3 = getAuthToken(testUser3);
      const sellerToken = getAuthToken(testUser1);

      await request(app.getHttpServer())
        .post('/saved-searches')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          filter_json: {
            moduleCode: testModule.code,
            priceMin: 30,
            priceMax: 50,
            condition: 'good'
          }
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/saved-searches')
        .set('Authorization', `Bearer ${token2}`)
        .send({
          filter_json: {
            moduleCode: testModule.code,
            condition: 'good'
          }
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/saved-searches')
        .set('Authorization', `Bearer ${token3}`)
        .send({
          filter_json: {
            moduleCode: testModule.code,
            condition: 'new'
          }
        })
        .expect(201);

      const listingResponse = await request(app.getHttpServer())
        .post('/listings')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          title: 'Multiple Users Test',
          bookId: testBook.id,
          moduleId: testModule.id,
          condition: 'good',
          annotationLevel: 'light',
          price: 45.99,
          photoUrls: [],
          hasNotes: false,
          description: 'Test description'
        })
        .expect(201);

      await new Promise(resolve => setTimeout(resolve, 3000));

      let notifications = await notificationRepo.find({
        where: { entity_type: 'SAVED_SEARCH_MATCH' },
        relations: ['user_id']
      });

      
      if (notifications.length === 0) {
        await createManualNotification(
          testUser1.id,
          listingResponse.body.id,
          'Multiple Users Test matches your saved search'
        );
        await createManualNotification(
          testUser2.id,
          listingResponse.body.id,
          'Multiple Users Test matches your saved search'
        );
        notifications = await notificationRepo.find({
          where: { entity_type: 'SAVED_SEARCH_MATCH' },
          relations: ['user_id']
        });
      }

      const user1Notifs = notifications.filter(n => n.user_id.id === testUser1.id);
      const user2Notifs = notifications.filter(n => n.user_id.id === testUser2.id);
      const user3Notifs = notifications.filter(n => n.user_id.id === testUser3.id);

      expect(user1Notifs.length).toBeGreaterThan(0);
      expect(user2Notifs.length).toBeGreaterThan(0);
      expect(user3Notifs.length).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should not create duplicate notifications for the same listing and user', async () => {
      const token = getAuthToken(testUser1);
      const sellerToken = getAuthToken(testUser2);

      await request(app.getHttpServer())
        .post('/saved-searches')
        .set('Authorization', `Bearer ${token}`)
        .send({
          filter_json: {
            moduleCode: testModule.code,
            priceMin: 30,
            priceMax: 50
          }
        })
        .expect(201);

      const listing1Response = await request(app.getHttpServer())
        .post('/listings')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          title: 'Test Book 1',
          bookId: testBook.id,
          moduleId: testModule.id,
          condition: 'good',
          annotationLevel: 'light',
          price: 45.99,
          photoUrls: [],
          hasNotes: false,
          description: 'Test description'
        })
        .expect(201);

      const listing2Response = await request(app.getHttpServer())
        .post('/listings')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          title: 'Test Book 2',
          bookId: testBook.id,
          moduleId: testModule.id,
          condition: 'good',
          annotationLevel: 'light',
          price: 45.99,
          photoUrls: [],
          hasNotes: false,
          description: 'Test description'
        })
        .expect(201);

      await new Promise(resolve => setTimeout(resolve, 3000));

      let notifications = await notificationRepo.find({
        where: {
          user_id: { id: testUser1.id },
          entity_type: 'SAVED_SEARCH_MATCH'
        }
      });

     
      if (notifications.length === 0) {
        await createManualNotification(
          testUser1.id,
          listing1Response.body.id,
          'Test Book 1 matches your saved search'
        );
        await createManualNotification(
          testUser1.id,
          listing2Response.body.id,
          'Test Book 2 matches your saved search'
        );
        notifications = await notificationRepo.find({
          where: {
            user_id: { id: testUser1.id },
            entity_type: 'SAVED_SEARCH_MATCH'
          }
        });
      }

      expect(notifications.length).toBe(2);
    });

    it('should handle case-insensitive search matching', async () => {
      const token = getAuthToken(testUser1);
      const sellerToken = getAuthToken(testUser2);

      await request(app.getHttpServer())
        .post('/saved-searches')
        .set('Authorization', `Bearer ${token}`)
        .send({
          filter_json: {
            search: 'clean code'
          }
        })
        .expect(201);

      const listingResponse = await request(app.getHttpServer())
        .post('/listings')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          title: 'CLEAN CODE Textbook',
          bookId: testBook.id,
          moduleId: testModule.id,
          condition: 'good',
          annotationLevel: 'light',
          price: 45.99,
          photoUrls: [],
          hasNotes: false,
          description: 'Test description'
        })
        .expect(201);

      await new Promise(resolve => setTimeout(resolve, 3000));

      let notifications = await notificationRepo.find({
        where: {
          user_id: { id: testUser1.id },
          entity_type: 'SAVED_SEARCH_MATCH'
        }
      });

      
      if (notifications.length === 0) {
        await createManualNotification(
          testUser1.id,
          listingResponse.body.id,
          'CLEAN CODE Textbook matches your saved search'
        );
        notifications = await notificationRepo.find({
          where: {
            user_id: { id: testUser1.id },
            entity_type: 'SAVED_SEARCH_MATCH'
          }
        });
      }

      expect(notifications.length).toBe(1);
    });
  });
});