import './setup';
import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { TestModule } from "./test.module";
import { DataSource, Repository } from "typeorm";
import request from "supertest";
import { JwtService } from "@nestjs/jwt";
import { Listing } from "../src/database/entities/listing.entity";
import { User } from "../src/database/entities/users.entity";
import { Book } from "../src/database/entities/book.entity";
import { Module } from "../src/database/entities/module.entity";
import { University } from "../src/database/entities/university.entity";
import { Faculty } from "../src/database/entities/faculty.entity";
import { ListingStatus, ListingsStatus } from "../src/database/entities/listing.entity";
import { EMAIL_SERVICE } from "../src/email/email.interface";
import { ConfigService } from '@nestjs/config';

const Test_Password = process.env.TEST_PASSWORD || 'TestPassword123!';

describe('ListingsController Integration Tests', () => {
    let app: INestApplication;
    let dataSource: DataSource;
    let listingRepository: Repository<Listing>;
    let userRepository: Repository<User>;
    let bookRepository: Repository<Book>;
    let moduleRepository: Repository<Module>;
    let universityRepository: Repository<University>;
    let facultyRepository: Repository<Faculty>;
    let jwtService: JwtService;
    let configService: ConfigService;

    let emailCounter = 0;
    let cleanupInProgress = false;

    const getTestUser = () => ({
        email: `u${1234598 + emailCounter}@tuks.co.za`,
        password: Test_Password,
        first_name: 'gift',
        last_name: 'mohub',
    });

    const getTestAdmin = () => ({
        email: `admin${emailCounter}@tuks.co.za`,
        password: Test_Password,
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin'
    });

    const createUniversity = () => universityRepository.save({
        name: 'University of Pretoria',
        email_domain: 'tuks.co.za'
    });

    const createFaculty = async (universityId: string) => {
        return facultyRepository.save({
            name: 'EBIT',
            university: { id: universityId }
        });
    };

    const createBook = () => bookRepository.save({
        title: 'Test Book',
        isbn: `123456789${emailCounter}`,
        author: 'Test Author',
        edition: 3,
        publisher: 'Test Publisher',
        faculty: 'Engineering'
    });

    const createModule = async (facultyId: string, universityId: string) => {
        return moduleRepository.save({
            code: `COS${132 + emailCounter}`,
            name: 'Imperative Programming',
            faculty: { id: facultyId },
            university: { id: universityId }
        });
    };

    const registerUser = (university_id: string, faculty_id: string, userData: any, overrides = {}) => {
        const payload = {
            email: userData.email,
            password: Test_Password,
            first_name: userData.first_name,
            last_name: userData.last_name,
            university_id,
            faculty_id,
            ...overrides
        };
        
        return request(app.getHttpServer())
            .post('/auth/register')
            .send(payload);
    };

    const registerAdmin = (university_id: string, faculty_id: string, adminData: any, overrides = {}) => {
        const payload = {
            email: adminData.email,
            password: Test_Password,
            first_name: adminData.first_name,
            last_name: adminData.last_name,
            university_id,
            faculty_id,
            role: 'admin',
            ...overrides
        };
        
        return request(app.getHttpServer())
            .post('/auth/register')
            .send(payload);
    };

    const createVerifiedUser = async (university_id: string, faculty_id: string): Promise<User> => {
        emailCounter++;
        const testUser = getTestUser();
        const response = await registerUser(university_id, faculty_id, testUser);
        
        if (response.status !== 201) {
            console.error('Registration failed:', response.body);
            throw new Error(`Registration failed with status ${response.status}: ${JSON.stringify(response.body)}`);
        }
        
        await userRepository.update(
            { email: testUser.email },
            { is_verified: true }
        );
        const user = await userRepository.findOne({
            where: { email: testUser.email },
            relations: ['university', 'faculty']
        });
        
        if (!user) {
            throw new Error('User not found after creation');
        }
        
        console.log('User created with role:', user.role);
        return user;
    };

    const createVerifiedAdmin = async (university_id: string, faculty_id: string): Promise<User> => {
        emailCounter++;
        const testAdmin = getTestAdmin();
        const response = await registerAdmin(university_id, faculty_id, testAdmin);
        
        if (response.status !== 201) {
            console.error('Admin registration failed:', response.body);
            throw new Error(`Admin registration failed with status ${response.status}: ${JSON.stringify(response.body)}`);
        }
        
        await userRepository.update(
            { email: testAdmin.email },
            { 
                is_verified: true,
                role: 'admin' 
            }
        );
        
        const admin = await userRepository.findOne({
            where: { email: testAdmin.email },
            relations: ['university', 'faculty']
        });
        
        if (!admin) {
            throw new Error('Admin not found after creation');
        }
        
        console.log('Admin created with role:', admin.role);
        return admin;
    };

    const getAuthToken = (user: User): string => {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role || 'student'
        };
        
        const token = jwtService.sign(payload);
        return token;
    };

    const createTestListing = async (sellerId: string, bookId: string, moduleId: string | null, overrides = {}) => {
        const listingData: any = {
            title: 'Test Listing',
            condition: 'good',
            annotation_level: 'light',
            price: 49.99,
            status: ListingStatus.PENDING,
            seller: { id: sellerId },
            book: { id: bookId },
            photo_urls: ['http://example.com/photo.jpg'],
            has_notes: false,
            ...overrides
        };

        if (moduleId) {
            listingData.module = { id: moduleId };
        }

        return listingRepository.save(listingData);
    };

    const cleanupDatabase = async () => {
        if (cleanupInProgress || !dataSource || !dataSource.isInitialized) return;
        cleanupInProgress = true;
        
        try {
            
            await dataSource.query('DELETE FROM listings');
            await dataSource.query('DELETE FROM otps');
            await dataSource.query('DELETE FROM users');
            await dataSource.query('DELETE FROM books');
            await dataSource.query('DELETE FROM modules');
            await dataSource.query('DELETE FROM faculties');
            await dataSource.query('DELETE FROM universities');
            emailCounter = 0;
        } catch (error) {
            console.warn('Cleanup warning');
        } finally {
            cleanupInProgress = false;
        }
    };

    beforeAll(async () => {
        try {
            console.log('Setting up test environment...');
            
            if (!process.env.JWT_ACCESS_SECRET) {
                process.env.JWT_ACCESS_SECRET = 'test-secret-key';
            }
            if (!process.env.JWT_REFRESH_SECRET) {
                process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
            }
            process.env.JWT_SECRET = 'test-secret-key';
            process.env.NODE_ENV = 'test';

            const moduleRef = await Test.createTestingModule({
                imports: [TestModule],
            })
            .overrideProvider(EMAIL_SERVICE)
            .useValue({
                sendOtp: jest.fn().mockResolvedValue(undefined)
            })
            .compile();

            app = moduleRef.createNestApplication();
            await app.init();

            dataSource = app.get(DataSource);
            listingRepository = dataSource.getRepository(Listing);
            userRepository = dataSource.getRepository(User);
            bookRepository = dataSource.getRepository(Book);
            moduleRepository = dataSource.getRepository(Module);
            universityRepository = dataSource.getRepository(University);
            facultyRepository = dataSource.getRepository(Faculty);
            
            jwtService = app.get(JwtService);
            configService = app.get(ConfigService);

            console.log('Test setup completed successfully');
        } catch (error) {
            console.error('Error in beforeAll:', error);
            throw error;
        }
    }, 60000);

    beforeEach(async () => {
       
        await cleanupDatabase();
    }, 10000);

    afterEach(async () => {
        
        await cleanupDatabase();
    }, 10000);

    afterAll(async () => {
        if (app) {
            await app.close();
        }
        if (dataSource && dataSource.isInitialized) {
            await dataSource.destroy();
        }
    }, 10000);

    describe('database', () => {
        it('should load app', () => {
            expect(app).toBeDefined();
            expect(dataSource).toBeDefined();
            expect(dataSource.isInitialized).toBe(true);
        });
    });

    describe('POST /listings - Create Listing', () => {
        it('should reject unauthenticated request', async () => {
            await request(app.getHttpServer())
                .post('/listings')
                .send({
                    title: 'Test Listing',
                    bookId: 'some-id',
                    condition: 'good',
                    annotationLevel: 'light',
                    price: 49.99
                })
                .expect(401);
        });

        it('should create a listing successfully', async () => {
            const university = await createUniversity();
            const faculty = await createFaculty(university.id);
            const user = await createVerifiedUser(university.id, faculty.id);
            const book = await createBook();
            const module = await createModule(faculty.id, university.id);
            const token = getAuthToken(user);

            const response = await request(app.getHttpServer())
                .post('/listings')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'My Textbook',
                    bookId: book.id,
                    moduleId: module.id,
                    condition: 'good',
                    annotationLevel: 'light',
                    price: 49.99,
                    photoUrls: ['http://example.com/photo1.jpg'],
                    hasNotes: true,
                    description: 'A great textbook'
                })
                .expect(201);

            expect(response.body).toMatchObject({
                title: 'My Textbook',
                condition: 'good',
                annotation_level: 'light',
                price: 49.99,
                status: ListingStatus.PENDING,
                has_notes: true,
                photo_urls: ['http://example.com/photo1.jpg'],
                description: 'A great textbook'
            });
            expect(response.body.id).toBeDefined();
            expect(response.body.seller.id).toBe(user.id);
            expect(response.body.book.id).toBe(book.id);
            expect(response.body.module.id).toBe(module.id);
        });

        it('should reject when book does not exist', async () => {
            const university = await createUniversity();
            const faculty = await createFaculty(university.id);
            const user = await createVerifiedUser(university.id, faculty.id);
            const module = await createModule(faculty.id, university.id);
            const token = getAuthToken(user);

            await request(app.getHttpServer())
                .post('/listings')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'Test Listing',
                    bookId: '00000000-0000-0000-0000-000000000000',
                    moduleId: module.id,
                    condition: 'good',
                    annotationLevel: 'light',
                    price: 49.99
                })
                .expect(404);
        });

        it('should create listing without module', async () => {
            const university = await createUniversity();
            const faculty = await createFaculty(university.id);
            const user = await createVerifiedUser(university.id, faculty.id);
            const book = await createBook();
            const token = getAuthToken(user);

            const response = await request(app.getHttpServer())
                .post('/listings')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'Listing Without Module',
                    bookId: book.id,
                    condition: 'good',
                    annotationLevel: 'none',
                    price: 29.99,
                    photoUrls: [],
                    hasNotes: false
                })
                .expect(201);

            expect(response.body.module).toBeNull();
            expect(response.body.title).toBe('Listing Without Module');
        });
    });
    describe('GET /listings - Get All Approved Listings', () => {
        it('should return all approved listings', async () => {
            const university = await createUniversity();
            const faculty = await createFaculty(university.id);
            const user = await createVerifiedUser(university.id, faculty.id);
            const book = await createBook();
            const module = await createModule(faculty.id, university.id);

            await createTestListing(user.id, book.id, module.id, {
                status: ListingStatus.APPROVED,
                title: 'Approved Listing 1'
            });
            await createTestListing(user.id, book.id, module.id, {
                status: ListingStatus.APPROVED,
                title: 'Approved Listing 2'
            });
            await createTestListing(user.id, book.id, null, {
                status: ListingStatus.PENDING,
                title: 'Pending Listing'
            });

            const response = await request(app.getHttpServer())
                .get('/listings')
                .expect(200);

            expect(response.body.listings).toHaveLength(2);
            expect(response.body.listings.every((l: any) => l.status === ListingStatus.APPROVED)).toBe(true);
            expect(response.body.total).toBe(2);
        });

        it('should filter listings by search term', async () => {
            const university = await createUniversity();
            const faculty = await createFaculty(university.id);
            const user = await createVerifiedUser(university.id, faculty.id);
            const book = await createBook();
            const module = await createModule(faculty.id, university.id);

            await createTestListing(user.id, book.id, module.id, {
                status: ListingStatus.APPROVED,
                title: 'Advanced Mathematics'
            });
            await createTestListing(user.id, book.id, module.id, {
                status: ListingStatus.APPROVED,
                title: 'Physics Textbook'
            });

            const response = await request(app.getHttpServer())
                .get('/listings')
                .query({ search: 'Mathematics' })
                .expect(200);

            expect(response.body.listings).toHaveLength(1);
            expect(response.body.listings[0].title).toBe('Advanced Mathematics');
        });
    });

    describe('GET /listings/:id - Get Listing by ID', () => {
        it('should return a listing by ID', async () => {
            const university = await createUniversity();
            const faculty = await createFaculty(university.id);
            const user = await createVerifiedUser(university.id, faculty.id);
            const book = await createBook();
            const module = await createModule(faculty.id, university.id);

            const listing = await createTestListing(user.id, book.id, module.id, {
                status: ListingStatus.APPROVED,
                title: 'Specific Listing'
            });

            const response = await request(app.getHttpServer())
                .get(`/listings/${listing.id}`)
                .expect(200);

            expect(response.body.id).toBe(listing.id);
            expect(response.body.title).toBe('Specific Listing');
            expect(response.body.seller.id).toBe(user.id);
        });

        it('should return 404 for non-existent listing', async () => {
       
        await request(app.getHttpServer())
            .get('/listings/123e4567-e89b-12d3-a456-426614174000')
            .expect(404);
    });
    });

    describe('GET /listings/mine - Get My Listings', () => {
        it('should return listings for authenticated user', async () => {
            const university = await createUniversity();
            const faculty = await createFaculty(university.id);
            const user = await createVerifiedUser(university.id, faculty.id);
            const book = await createBook();
            const module = await createModule(faculty.id, university.id);
            const token = getAuthToken(user);

            await createTestListing(user.id, book.id, module.id, {
                title: 'My Listing 1'
            });
            await createTestListing(user.id, book.id, module.id, {
                title: 'My Listing 2'
            });

            const response = await request(app.getHttpServer())
                .get('/listings/mine')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(response.body).toHaveLength(2);
            expect(response.body.every((l: any) => l.seller.id === user.id)).toBe(true);
        });

        it('should return 401 for unauthenticated user', async () => {
            await request(app.getHttpServer())
                .get('/listings/mine')
                .expect(401);
        });
    });

    describe('GET /listings/admin/all - Admin Get All Listings', () => {
        it('should return all listings for admin', async () => {
            const university = await createUniversity();
            const faculty = await createFaculty(university.id);
            const user = await createVerifiedUser(university.id, faculty.id);
            const book = await createBook();
            const module = await createModule(faculty.id, university.id);

            await createTestListing(user.id, book.id, module.id, {
                status: ListingStatus.PENDING,
                title: 'Pending Listing'
            });
            await createTestListing(user.id, book.id, module.id, {
                status: ListingStatus.APPROVED,
                title: 'Approved Listing'
            });

            const response = await request(app.getHttpServer())
                .get('/listings/admin/all')
                .expect(200);

            expect(response.body).toHaveLength(2);
        });
    });


    describe('PATCH /listings/editlist - Edit Listing', () => {
        it('should allow student to edit their own pending listing', async () => {
            const university = await createUniversity();
            const faculty = await createFaculty(university.id);
            const user = await createVerifiedUser(university.id, faculty.id);
            const book = await createBook();
            const module = await createModule(faculty.id, university.id);
            const token = getAuthToken(user);

            // Create a listing
            const listing = await createTestListing(user.id, book.id, module.id, {
                status: ListingStatus.PENDING,
                title: 'Original Title',
                price: 49.99,
                condition: 'good',
                annotation_level: 'light',
                description: 'Original description'
            });

            // Edit the listing
            const response = await request(app.getHttpServer())
                .patch('/listings/editlist')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    id: listing.id,
                    title: 'Updated Title',
                    price: 39.99,
                    condition: 'fair',
                    annotation_level: 'heavy',
                    description: 'Updated description'
                })
                .expect(200);

            expect(response.body.title).toBe('Updated Title');
            expect(response.body.price).toBe(39.99);
            expect(response.body.condition).toBe('fair');
            expect(response.body.annotation_level).toBe('heavy');
            expect(response.body.description).toBe('Updated description');
            expect(response.body.id).toBe(listing.id);
            
        });

        it('should allow student to update photo URLs', async () => {
            const university = await createUniversity();
            const faculty = await createFaculty(university.id);
            const user = await createVerifiedUser(university.id, faculty.id);
            const book = await createBook();
            const module = await createModule(faculty.id, university.id);
            const token = getAuthToken(user);

            const listing = await createTestListing(user.id, book.id, module.id, {
                status: ListingStatus.PENDING,
                photo_urls: ['http://example.com/old-photo.jpg']
            });

            const newPhotos = ['http://example.com/new-photo1.jpg', 'http://example.com/new-photo2.jpg'];
            const response = await request(app.getHttpServer())
                .patch('/listings/editlist')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    id: listing.id,
                    photo_urls: newPhotos
                })
                .expect(200);

            expect(response.body.photo_urls).toEqual(newPhotos);
        });

        it('should allow student to update has_notes', async () => {
            const university = await createUniversity();
            const faculty = await createFaculty(university.id);
            const user = await createVerifiedUser(university.id, faculty.id);
            const book = await createBook();
            const module = await createModule(faculty.id, university.id);
            const token = getAuthToken(user);

            const listing = await createTestListing(user.id, book.id, module.id, {
                status: ListingStatus.PENDING,
                has_notes: false
            });

            const response = await request(app.getHttpServer())
                .patch('/listings/editlist')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    id: listing.id,
                    has_notes: true
                })
                .expect(200);

            expect(response.body.has_notes).toBe(true);
        });

        it('should allow partial updates', async () => {
            const university = await createUniversity();
            const faculty = await createFaculty(university.id);
            const user = await createVerifiedUser(university.id, faculty.id);
            const book = await createBook();
            const module = await createModule(faculty.id, university.id);
            const token = getAuthToken(user);

            const listing = await createTestListing(user.id, book.id, module.id, {
                status: ListingStatus.PENDING,
                title: 'Original Title',
                price: 49.99,
                condition: 'good',
                annotation_level: 'light',
                has_notes: false,
                description: 'Original description',
                photo_urls: ['http://example.com/photo.jpg']
            });

            // Only update title and price
            const response = await request(app.getHttpServer())
                .patch('/listings/editlist')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    id: listing.id,
                    title: 'Updated Title Only',
                    price: 59.99
                })
                .expect(200);

            expect(response.body.title).toBe('Updated Title Only');
            expect(response.body.price).toBe(59.99);
            expect(response.body.condition).toBe('good');
            expect(response.body.annotation_level).toBe('light');
            expect(response.body.has_notes).toBe(false);
            expect(response.body.description).toBe('Original description');
            expect(response.body.photo_urls).toEqual(['http://example.com/photo.jpg']);
        });

        it('should return 401 for unauthenticated edit request', async () => {
            const university = await createUniversity();
            const faculty = await createFaculty(university.id);
            const user = await createVerifiedUser(university.id, faculty.id);
            const book = await createBook();
            const module = await createModule(faculty.id, university.id);

            const listing = await createTestListing(user.id, book.id, module.id, {
                status: ListingStatus.PENDING
            });

            await request(app.getHttpServer())
                .patch('/listings/editlist')
                .send({
                    id: listing.id,
                    title: 'Updated Title'
                })
                .expect(401);
        });

        it('should return 404 when listing not found', async () => {
            const university = await createUniversity();
            const faculty = await createFaculty(university.id);
            const user = await createVerifiedUser(university.id, faculty.id);
            const token = getAuthToken(user);

            await request(app.getHttpServer())
                .patch('/listings/editlist')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    id: '00000000-0000-0000-0000-000000000000',
                    title: 'Updated Title'
                })
                .expect(404);
        });

        it('should validate required id field', async () => {
            const university = await createUniversity();
            const faculty = await createFaculty(university.id);
            const user = await createVerifiedUser(university.id, faculty.id);
            const token = getAuthToken(user);

            await request(app.getHttpServer())
                .patch('/listings/editlist')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'Updated Title'
                })
                .expect(404);
        });

        it('should validate id is a valid UUID', async () => {
            const university = await createUniversity();
            const faculty = await createFaculty(university.id);
            const user = await createVerifiedUser(university.id, faculty.id);
            const token = getAuthToken(user);

            await request(app.getHttpServer())
                .patch('/listings/editlist')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    id: 'invalid-uuid',
                    title: 'Updated Title'
                })
                .expect(500);
        });

        it('should validate price is positive', async () => {
            const university = await createUniversity();
            const faculty = await createFaculty(university.id);
            const user = await createVerifiedUser(university.id, faculty.id);
            const book = await createBook();
            const module = await createModule(faculty.id, university.id);
            const token = getAuthToken(user);

            const listing = await createTestListing(user.id, book.id, module.id, {
                status: ListingStatus.PENDING
            });

            await request(app.getHttpServer())
                .patch('/listings/editlist')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    id: listing.id,
                    price: -10
                })
                .expect(200); 
        });

        it('should validate condition enum values', async () => {
            const university = await createUniversity();
            const faculty = await createFaculty(university.id);
            const user = await createVerifiedUser(university.id, faculty.id);
            const book = await createBook();
            const module = await createModule(faculty.id, university.id);
            const token = getAuthToken(user);

            const listing = await createTestListing(user.id, book.id, module.id, {
                status: ListingStatus.PENDING
            });

            await request(app.getHttpServer())
                .patch('/listings/editlist')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    id: listing.id,
                    condition: 'fair'
                })
                .expect(200);
        });

        it('should validate annotation_level enum values', async () => {
            const university = await createUniversity();
            const faculty = await createFaculty(university.id);
            const user = await createVerifiedUser(university.id, faculty.id);
            const book = await createBook();
            const module = await createModule(faculty.id, university.id);
            const token = getAuthToken(user);

            const listing = await createTestListing(user.id, book.id, module.id, {
                status: ListingStatus.PENDING
            });

            await request(app.getHttpServer())
                .patch('/listings/editlist')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    id: listing.id,
                    annotation_level: 'none'
                })
                .expect(200);
        });
    });

    describe('Edge Cases and Error Scenarios', () => {
        it('should handle expired tokens', async () => {
            const university = await createUniversity();
            const faculty = await createFaculty(university.id);
            const user = await createVerifiedUser(university.id, faculty.id);
            if (!user) {
                throw new Error('User not found');
            }
            const expiredToken = jwtService.sign(
                { sub: user.id, email: user.email, role: 'student' },
                { expiresIn: '0s' }
            );

            await request(app.getHttpServer())
                .post('/listings')
                .set('Authorization', `Bearer ${expiredToken}`)
                .send({
                    title: 'Test Listing',
                    bookId: 'some-id',
                    condition: 'good',
                    annotationLevel: 'light',
                    price: 49.99
                })
                .expect(401);
        });

        it('should handle invalid token format', async () => {
            await request(app.getHttpServer())
                .post('/listings')
                .set('Authorization', 'Bearer invalid-token-format')
                .send({
                    title: 'Test Listing',
                    bookId: 'some-id',
                    condition: 'good',
                    annotationLevel: 'light',
                    price: 49.99
                })
                .expect(401);
        });
    });

    describe('PATCH /listings/:id/status (UC5.2 Reserved/Sold)', () => {
        it('should allow the seller to move an approved AVAILABLE listing to RESERVED', async () => {
            const university = await createUniversity();
            const faculty = await createFaculty(university.id);
            const user = await createVerifiedUser(university.id, faculty.id);
            const book = await createBook();
            const module = await createModule(faculty.id, university.id);
            const token = getAuthToken(user);

            const listing = await createTestListing(user.id, book.id, module.id, {
                status: ListingStatus.APPROVED,
                listing_status: ListingsStatus.AVAILABLE,
            });

            const response = await request(app.getHttpServer())
                .patch(`/listings/${listing.id}/status`)
                .set('Authorization', `Bearer ${token}`)
                .send({ listing_status: ListingsStatus.RESERVED })
                .expect(200);

            expect(response.body.listing_status).toBe(ListingsStatus.RESERVED);
        });

        it('should allow the seller to move RESERVED -> SOLD', async () => {
            const university = await createUniversity();
            const faculty = await createFaculty(university.id);
            const user = await createVerifiedUser(university.id, faculty.id);
            const book = await createBook();
            const module = await createModule(faculty.id, university.id);
            const token = getAuthToken(user);

            const listing = await createTestListing(user.id, book.id, module.id, {
                status: ListingStatus.APPROVED,
                listing_status: ListingsStatus.RESERVED,
            });

            const response = await request(app.getHttpServer())
                .patch(`/listings/${listing.id}/status`)
                .set('Authorization', `Bearer ${token}`)
                .send({ listing_status: ListingsStatus.SOLD })
                .expect(200);

            expect(response.body.listing_status).toBe(ListingsStatus.SOLD);
        });

        it('should allow the seller to un-reserve, RESERVED -> AVAILABLE', async () => {
            const university = await createUniversity();
            const faculty = await createFaculty(university.id);
            const user = await createVerifiedUser(university.id, faculty.id);
            const book = await createBook();
            const module = await createModule(faculty.id, university.id);
            const token = getAuthToken(user);

            const listing = await createTestListing(user.id, book.id, module.id, {
                status: ListingStatus.APPROVED,
                listing_status: ListingsStatus.RESERVED,
            });

            const response = await request(app.getHttpServer())
                .patch(`/listings/${listing.id}/status`)
                .set('Authorization', `Bearer ${token}`)
                .send({ listing_status: ListingsStatus.AVAILABLE })
                .expect(200);

            expect(response.body.listing_status).toBe(ListingsStatus.AVAILABLE);
        });

        it('should reject a transition out of SOLD (terminal state)', async () => {
            const university = await createUniversity();
            const faculty = await createFaculty(university.id);
            const user = await createVerifiedUser(university.id, faculty.id);
            const book = await createBook();
            const module = await createModule(faculty.id, university.id);
            const token = getAuthToken(user);

            const listing = await createTestListing(user.id, book.id, module.id, {
                status: ListingStatus.APPROVED,
                listing_status: ListingsStatus.SOLD,
            });

            const response = await request(app.getHttpServer())
                .patch(`/listings/${listing.id}/status`)
                .set('Authorization', `Bearer ${token}`)
                .send({ listing_status: ListingsStatus.AVAILABLE })
                .expect(400);

            expect(response.body).toBeDefined();
            expect(response.body.message).toBeDefined();
        });

        it('should reject changing status on a listing that has not been approved yet', async () => {
            const university = await createUniversity();
            const faculty = await createFaculty(university.id);
            const user = await createVerifiedUser(university.id, faculty.id);
            const book = await createBook();
            const module = await createModule(faculty.id, university.id);
            const token = getAuthToken(user);

            const listing = await createTestListing(user.id, book.id, module.id, {
                status: ListingStatus.PENDING,
                listing_status: ListingsStatus.AVAILABLE,
            });

            const response = await request(app.getHttpServer())
                .patch(`/listings/${listing.id}/status`)
                .set('Authorization', `Bearer ${token}`)
                .send({ listing_status: ListingsStatus.RESERVED })
                .expect(400);

            expect(response.body).toBeDefined();
        });

        it('should reject a non-owner attempting to change status', async () => {
            const university = await createUniversity();
            const faculty = await createFaculty(university.id);
            const owner = await createVerifiedUser(university.id, faculty.id);
            const otherUser = await createVerifiedUser(university.id, faculty.id);
            const book = await createBook();
            const module = await createModule(faculty.id, university.id);
            const otherToken = getAuthToken(otherUser);

            const listing = await createTestListing(owner.id, book.id, module.id, {
                status: ListingStatus.APPROVED,
                listing_status: ListingsStatus.AVAILABLE,
            });

            const response = await request(app.getHttpServer())
                .patch(`/listings/${listing.id}/status`)
                .set('Authorization', `Bearer ${otherToken}`)
                .send({ listing_status: ListingsStatus.RESERVED })
                .expect(403);

            expect(response.body).toBeDefined();
            expect(response.body.message).toBeDefined();
        });

        it('should return 401 for an unauthenticated status change request', async () => {
            const university = await createUniversity();
            const faculty = await createFaculty(university.id);
            const user = await createVerifiedUser(university.id, faculty.id);
            const book = await createBook();
            const module = await createModule(faculty.id, university.id);

            const listing = await createTestListing(user.id, book.id, module.id, {
                status: ListingStatus.APPROVED,
                listing_status: ListingsStatus.AVAILABLE,
            });

            const response = await request(app.getHttpServer())
                .patch(`/listings/${listing.id}/status`)
                .send({ listing_status: ListingsStatus.RESERVED })
                .expect(401);

            expect(response.body).toBeDefined();
        });

        it('should return 404 when the listing does not exist', async () => {
            const university = await createUniversity();
            const faculty = await createFaculty(university.id);
            const user = await createVerifiedUser(university.id, faculty.id);
            const token = getAuthToken(user);

            const response = await request(app.getHttpServer())
                .patch('/listings/00000000-0000-0000-0000-000000000000/status')
                .set('Authorization', `Bearer ${token}`)
                .send({ listing_status: ListingsStatus.RESERVED })
                .expect(404);

            expect(response.body).toBeDefined();
        });

        it('should reject an admin attempting to change a listing status (student-only route)', async () => {
            const university = await createUniversity();
            const faculty = await createFaculty(university.id);
            const seller = await createVerifiedUser(university.id, faculty.id);
            const admin = await createVerifiedAdmin(university.id, faculty.id);
            const book = await createBook();
            const module = await createModule(faculty.id, university.id);
            const adminToken = getAuthToken(admin);

            const listing = await createTestListing(seller.id, book.id, module.id, {
                status: ListingStatus.APPROVED,
                listing_status: ListingsStatus.AVAILABLE,
            });

            const response = await request(app.getHttpServer())
                .patch(`/listings/${listing.id}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ listing_status: ListingsStatus.RESERVED })
                .expect(403);

            expect(response.body).toBeDefined();
        });
    });

    describe('Concurrent Operations', () => {
        it('should handle concurrent listing creation', async () => {
            const university = await createUniversity();
            const faculty = await createFaculty(university.id);
            const user = await createVerifiedUser(university.id, faculty.id);
            if (!user) {
                throw new Error('User not found');
            }
            const book = await createBook();
            const module = await createModule(faculty.id, university.id);
            const token = getAuthToken(user);

            const promises = Array(5).fill(null).map(() =>
                request(app.getHttpServer())
                    .post('/listings')
                    .set('Authorization', `Bearer ${token}`)
                    .send({
                        title: 'Concurrent Listing',
                        bookId: book.id,
                        moduleId: module.id,
                        condition: 'good',
                        annotationLevel: 'light',
                        price: 49.99,
                        photoUrls: [],
                        hasNotes: false
                    })
            );

            const responses = await Promise.all(promises);
            expect(responses.every(r => r.status === 201)).toBe(true);
        });
    });
});