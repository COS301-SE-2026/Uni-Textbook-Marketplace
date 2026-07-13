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
import { ListingStatus } from "../src/database/entities/listing.entity";
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

    const createModule = () => moduleRepository.save({
        code: `COS${132 + emailCounter}`,
        name: 'Imperative Programming',
        faculty: 'Engineering'
    });

    const registerUser = (university_id: string, faculty_id: string, userData: any, overrides = {}) =>
        request(app.getHttpServer())
            .post('/auth/register')
            .send({
                email: userData.email,
                password: Test_Password,
                first_name: userData.first_name,
                last_name: userData.last_name,
                university_id,
                faculty_id,
                ...overrides
            });

    const registerAdmin = (university_id: string, faculty_id: string, adminData: any, overrides = {}) =>
        request(app.getHttpServer())
            .post('/auth/register')
            .send({
                email: adminData.email,
                password: Test_Password,
                first_name: adminData.first_name,
                last_name: adminData.last_name,
                university_id,
                faculty_id,
                role: 'admin',
                ...overrides
            });

    const createVerifiedUser = async (university_id: string, faculty_id: string): Promise<User> => {
        emailCounter++;
        const testUser = getTestUser();
        await registerUser(university_id, faculty_id, testUser).expect(201);
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
        await registerAdmin(university_id, faculty_id, testAdmin).expect(201);
        
        
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
    
    console.log('Creating token with payload:', JSON.stringify(payload, null, 2));
    console.log('User ID:', user.id);
    console.log(' User email:', user.email);
    console.log('User role from DB:', user.role);
    
    const token = jwtService.sign(payload);
    console.log('Token created (first 50 chars):', token.substring(0, 50) + '...');
    
    // Try to verify and get the decoded token
    try {
        const decoded = jwtService.verify(token);
        console.log('Token decoded:', JSON.stringify(decoded, null, 2));
    } catch (error) {
        console.error('Token verification failed:', error);
    }
    
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
            console.log('JWT_ACCESS_SECRET from env:', process.env.JWT_ACCESS_SECRET ? 'Set' : 'Not set');

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
            
            const jwtSecret = configService.get('JWT_ACCESS_SECRET');
            console.log('App JWT_ACCESS_SECRET:', jwtSecret);
            
            const testPayload = { sub: 'test-id', email: 'test@test.com', role: 'student' };
            const testToken = jwtService.sign(testPayload);
            console.log('Test token created:', testToken.substring(0, 30) + '...');
            
            try {
                const verified = jwtService.verify(testToken);
                console.log('JWT verification works');
            } catch (error) {
                console.error('JWT verification failed:', error);
                throw error;
            }

            console.log('Test setup completed successfully');
        } catch (error) {
            console.error('Error in beforeAll:', error);
            throw error;
        }
    }, 30000);

    afterEach(async () => {
        if (dataSource && dataSource.isInitialized) {
            try {
                await dataSource.query('TRUNCATE TABLE listings CASCADE');
                await dataSource.query('TRUNCATE TABLE otps CASCADE');
                await dataSource.query('TRUNCATE TABLE users CASCADE');
                await dataSource.query('TRUNCATE TABLE books CASCADE');
                await dataSource.query('TRUNCATE TABLE modules CASCADE');
                await dataSource.query('TRUNCATE TABLE faculties CASCADE');
                await dataSource.query('TRUNCATE TABLE universities CASCADE');
                
                emailCounter = 0;
            } catch (error) {
                console.error('Error in afterEach cleanup:', error);
            }
        }
    });

    afterAll(async () => {
        if (app) {
            await app.close();
        }
        if (dataSource && dataSource.isInitialized) {
            await dataSource.destroy();
        }
    });

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
            const module = await createModule();
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
                    hasNotes: true
                })
                .expect(201);

            expect(response.body).toMatchObject({
                title: 'My Textbook',
                condition: 'good',
                annotation_level: 'light',
                price: 49.99,
                status: ListingStatus.PENDING,
                has_notes: true,
                photo_urls: ['http://example.com/photo1.jpg']
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
            const module = await createModule();
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
            const module = await createModule();

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

            expect(response.body).toHaveLength(2);
            expect(response.body.every((l: any) => l.status === ListingStatus.APPROVED)).toBe(true);
        });
    });

    describe('GET /listings/admin/pending - Admin Get Pending Listings', () => {
        it('should return pending listings for admin', async () => {
            const university = await createUniversity();
            const faculty = await createFaculty(university.id);
            const admin = await createVerifiedAdmin(university.id, faculty.id);
            if (!admin) {
                throw new Error('Admin not found');
            }
            console.log('Admin role in test:', admin.role); 
            const user = await createVerifiedUser(university.id, faculty.id);
            if (!user) {
                throw new Error('User not found');
            }
            const book = await createBook();
            const module = await createModule();
            const token = getAuthToken(admin);

            await createTestListing(user.id, book.id, module.id, {
                title: 'Pending 1',
                status: ListingStatus.PENDING
            });
            await createTestListing(user.id, book.id, null, {
                title: 'Pending 2',
                status: ListingStatus.PENDING
            });
            await createTestListing(user.id, book.id, module.id, {
                title: 'Approved',
                status: ListingStatus.APPROVED
            });

            const response = await request(app.getHttpServer())
                .get('/listings/admin/pending')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(response.body).toHaveLength(2);
            expect(response.body.every((l: any) => l.status === ListingStatus.PENDING)).toBe(true);
        });

        it('should return 403 for non-admin users', async () => {
            const university = await createUniversity();
            const faculty = await createFaculty(university.id);
            const user = await createVerifiedUser(university.id, faculty.id);
            if (!user) {
                throw new Error('User not found');
            }
            const token = getAuthToken(user);

            await request(app.getHttpServer())
                .get('/listings/admin/pending')
                .set('Authorization', `Bearer ${token}`)
                .expect(403);
        });
    });
    describe('PATCH /listings/admin/:id/approve - Admin Approve Listing', () => {
        it('should approve pending listing for admin', async () => {
            const university = await createUniversity();
            const faculty = await createFaculty(university.id);
            const admin = await createVerifiedAdmin(university.id, faculty.id);
            if (!admin) {
                throw new Error('Admin not found');
            }
            const user = await createVerifiedUser(university.id, faculty.id);
            if (!user) {
                throw new Error('User not found');
            }
            const book = await createBook();
            const module = await createModule();
            const token = getAuthToken(admin);

            const listing = await createTestListing(user.id, book.id, module.id, {
                status: ListingStatus.PENDING
            });

            const response = await request(app.getHttpServer())
                .patch(`/listings/admin/${listing.id}/approve`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(response.body.status).toBe(ListingStatus.APPROVED);
            expect(response.body.reviewer.id).toBe(admin.id);
            expect(response.body.reviewed_at).toBeDefined();
        });

        it('should return 403 for non-admin users', async () => {
            const university = await createUniversity();
            const faculty = await createFaculty(university.id);
            const user = await createVerifiedUser(university.id, faculty.id);
            if (!user) {
                throw new Error('User not found');
            }
            const book = await createBook();
            const module = await createModule();
            const token = getAuthToken(user);

            const listing = await createTestListing(user.id, book.id, module.id, {
                status: ListingStatus.PENDING
            });

            await request(app.getHttpServer())
                .patch(`/listings/admin/${listing.id}/approve`)
                .set('Authorization', `Bearer ${token}`)
                .expect(403);
        });

        it('should return 404 when listing not found', async () => {
            const university = await createUniversity();
            const faculty = await createFaculty(university.id);
            const admin = await createVerifiedAdmin(university.id, faculty.id);
            if (!admin) {
                throw new Error('Admin not found');
            }
            const token = getAuthToken(admin);

            await request(app.getHttpServer())
                .patch('/listings/admin/non-existent-id/approve')
                .set('Authorization', `Bearer ${token}`)
                .expect(404);
        });
    });

    describe('PATCH /listings/admin/:id/reject - Admin Reject Listing', () => {
        it('should reject pending listing for admin', async () => {
            const university = await createUniversity();
            const faculty = await createFaculty(university.id);
            const admin = await createVerifiedAdmin(university.id, faculty.id);
            if (!admin) {
                throw new Error('Admin not found');
            }
            const user = await createVerifiedUser(university.id, faculty.id);
            if (!user) {
                throw new Error('User not found');
            }
            const book = await createBook();
            const module = await createModule();
            const token = getAuthToken(admin);

            const listing = await createTestListing(user.id, book.id, module.id, {
                status: ListingStatus.PENDING
            });

            const response = await request(app.getHttpServer())
                .patch(`/listings/admin/${listing.id}/reject`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(response.body.status).toBe(ListingStatus.REJECTED);
            expect(response.body.reviewer.id).toBe(admin.id);
            expect(response.body.reviewed_at).toBeDefined();
        });

        it('should return 403 for non-admin users', async () => {
            const university = await createUniversity();
            const faculty = await createFaculty(university.id);
            const user = await createVerifiedUser(university.id, faculty.id);
            if (!user) {
                throw new Error('User not found');
            }
            const book = await createBook();
            const module = await createModule();
            const token = getAuthToken(user);

            const listing = await createTestListing(user.id, book.id, module.id, {
                status: ListingStatus.PENDING
            });

            await request(app.getHttpServer())
                .patch(`/listings/admin/${listing.id}/reject`)
                .set('Authorization', `Bearer ${token}`)
                .expect(403);
        });
    });

    describe('Edge Cases and Error Scenarios', () => {
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

    describe('Concurrent Operations', () => {
        it('should handle concurrent listing creation', async () => {
            const university = await createUniversity();
            const faculty = await createFaculty(university.id);
            const user = await createVerifiedUser(university.id, faculty.id);
            if (!user) {
                throw new Error('User not found');
            }
            const book = await createBook();
            const module = await createModule();
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