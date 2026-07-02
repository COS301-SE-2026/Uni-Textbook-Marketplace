import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { AppModule } from "../src/app.module";
import { DataSource, Repository } from "typeorm";
import request from "supertest";

import { Listing } from "../src/database/entities/listing.entity";
import { User } from "../src/database/entities/users.entity";
import { Book } from "../src/database/entities/book.entity";
import { Module } from "../src/database/entities/module.entity";
import { University } from "../src/database/entities/university.entity";
import { ListingStatus } from "../src/database/entities/listing.entity";
import { JwtService } from "@nestjs/jwt";

const Test_Password = process.env.TEST_PASSWORD;

describe('ListingsController Integration Tests', () => {
    let app: INestApplication;
    let dataSource: DataSource;
    let listingRepository: Repository<Listing>;
    let userRepository: Repository<User>;
    let bookRepository: Repository<Book>;
    let moduleRepository: Repository<Module>;
    let universityRepository: Repository<University>;
    let jwtService: JwtService;

    // Test data
    const testUser = {
        email: 'u1234598@tuks.co.za',
        password: Test_Password,
        first_name: 'gift',
        last_name: 'mohub',
        faculty: 'EBIT'
    };

    const testAdmin = {
        email: 'admin@tuks.co.za',
        password: Test_Password,
        first_name: 'Admin',
        last_name: 'User',
        faculty: 'EBIT',
        role: 'admin'
    };
    // Helper functions
    const createUniversity = () => universityRepository.save({
        name: 'University of Pretoria',
        email_domain: 'tuks.co.za'
    });

    const createBook = () => bookRepository.save({
        title: 'Test Book',
        isbn: '1234567890',
        author: 'Test Author',
        edition: 3,
        publisher: 'Test Publisher',
        faculty: 'Engineering'
    });

    const createModule = () => moduleRepository.save({
        code: 'COS132',
        name: 'Imperative Programming',
        faculty: 'Engineering'
    });

    const registerUser = (university_id: string, overrides = {}) =>
        request(app.getHttpServer())
            .post('/auth/register')
            .send({
                email: testUser.email,
                password: Test_Password,
                first_name: testUser.first_name,
                last_name: testUser.last_name,
                faculty: testUser.faculty,
                university_id,
                ...overrides
            });

    const registerAdmin = (university_id: string, overrides = {}) =>
        request(app.getHttpServer())
            .post('/auth/register')
            .send({
                email: testAdmin.email,
                password: Test_Password,
                first_name: testAdmin.first_name,
                last_name: testAdmin.last_name,
                faculty: testAdmin.faculty,
                university_id,
                role: 'admin',
                ...overrides
            });

    const createVerifiedUser = async (university_id: string) => {
        await registerUser(university_id).expect(201);
        await userRepository.update(
            { email: testUser.email },
            { is_verified: true }
        );
        const user = await userRepository.findOneBy({ email: testUser.email });
        return user;
    };

    const createVerifiedAdmin = async (university_id: string) => {
        await registerAdmin(university_id).expect(201);
        await userRepository.update(
            { email: testAdmin.email },
            { is_verified: true }
        );
        const admin = await userRepository.findOneBy({ email: testAdmin.email });
        return admin;
    };

    const getAuthToken = (user: User) => {
        return jwtService.sign({
            sub: user.id,
            email: user.email,
            role: user.role || 'user'
        });
    };

    const createTestListing = async (sellerId: string, bookId: string, moduleId: string, overrides = {}) => {
        return listingRepository.save({
            title: 'Test Listing',
            condition: 'good',
            annotation_level: 'light',
            price: 49.99,
            status: ListingStatus.PENDING,
            seller: { id: sellerId },
            book: { id: bookId },
            module: { id: moduleId },
            photo_urls: ['http://example.com/photo.jpg'],
            has_notes: false,
            ...overrides
        });
    };

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule]
        }).compile();

        app = moduleRef.createNestApplication();
        await app.init();

        dataSource = moduleRef.get(DataSource);
        listingRepository = dataSource.getRepository(Listing);
        userRepository = dataSource.getRepository(User);
        bookRepository = dataSource.getRepository(Book);
        moduleRepository = dataSource.getRepository(Module);
        universityRepository = dataSource.getRepository(University);
        jwtService = moduleRef.get(JwtService);
    });

    afterEach(async () => {
        await dataSource.query(
            'TRUNCATE TABLE listings, books, modules, users, universities CASCADE'
        );
    });

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });

    describe('database', () => {
        it('should load app', () => {
            expect(true).toBe(true);
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
            const user = await createVerifiedUser(university.id);
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
            const user = await createVerifiedUser(university.id);
            const module = await createModule();
            const token = getAuthToken(user);

            await request(app.getHttpServer())
                .post('/listings')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'Test Listing',
                    bookId: 'non-existent-book-id',
                    moduleId: module.id,
                    condition: 'good',
                    annotationLevel: 'light',
                    price: 49.99
                })
                .expect(404);
        });

        it('should create listing without module', async () => {
            const university = await createUniversity();
            const user = await createVerifiedUser(university.id);
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
            const user = await createVerifiedUser(university.id);
            const book = await createBook();
            const module = await createModule();

            // Create approved listings
            await createTestListing(user.id, book.id, module.id, {
                status: ListingStatus.APPROVED,
                title: 'Approved Listing 1'
            });
            await createTestListing(user.id, book.id, module.id, {
                status: ListingStatus.APPROVED,
                title: 'Approved Listing 2'
            });
            // Create pending listing (should not be returned)
            await createTestListing(user.id, book.id, module.id, {
                status: ListingStatus.PENDING,
                title: 'Pending Listing'
            });

            const response = await request(app.getHttpServer())
                .get('/listings')
                .expect(200);

            expect(response.body).toHaveLength(2);
            expect(response.body.every((l: any) => l.status === ListingStatus.APPROVED)).toBe(true);
            expect(response.body.map((l: any) => l.title)).toContain('Approved Listing 1');
            expect(response.body.map((l: any) => l.title)).toContain('Approved Listing 2');
        });

        it('should filter listings by module code', async () => {
            const university = await createUniversity();
            const user = await createVerifiedUser(university.id);
            const book = await createBook();
            const module1 = await createModule();
            const module2 = await moduleRepository.save({
                code: 'COS110',
                name: 'Programming',
                faculty: 'Engineering'
            });

            await createTestListing(user.id, book.id, module1.id, {
                status: ListingStatus.APPROVED,
                title: 'COS132 Listing'
            });
            await createTestListing(user.id, book.id, module2.id, {
                status: ListingStatus.APPROVED,
                title: 'COS110 Listing'
            });

            const response = await request(app.getHttpServer())
                .get('/listings?moduleCode=COS132')
                .expect(200);

            expect(response.body).toHaveLength(1);
            expect(response.body[0].title).toBe('COS132 Listing');
        });

        it('should filter listings by condition', async () => {
            const university = await createUniversity();
            const user = await createVerifiedUser(university.id);
            const book = await createBook();
            const module = await createModule();

            await createTestListing(user.id, book.id, module.id, {
                status: ListingStatus.APPROVED,
                condition: 'good',
                title: 'Good Condition'
            });
            await createTestListing(user.id, book.id, module.id, {
                status: ListingStatus.APPROVED,
                condition: 'new',
                title: 'New Condition'
            });

            const response = await request(app.getHttpServer())
                .get('/listings?condition=good')
                .expect(200);

            expect(response.body).toHaveLength(1);
            expect(response.body[0].condition).toBe('good');
        });

        it('should filter listings by price range', async () => {
            const university = await createUniversity();
            const user = await createVerifiedUser(university.id);
            const book = await createBook();
            const module = await createModule();

            await createTestListing(user.id, book.id, module.id, {
                status: ListingStatus.APPROVED,
                price: 29.99,
                title: 'Cheap Book'
            });
            await createTestListing(user.id, book.id, module.id, {
                status: ListingStatus.APPROVED,
                price: 89.99,
                title: 'Expensive Book'
            });

            const response = await request(app.getHttpServer())
                .get('/listings?priceMin=30&priceMax=100')
                .expect(200);

            expect(response.body).toHaveLength(1);
            expect(response.body[0].price).toBe(89.99);
        });

        it('should combine multiple filters', async () => {
            const university = await createUniversity();
            const user = await createVerifiedUser(university.id);
            const book = await createBook();
            const module = await createModule();

            await createTestListing(user.id, book.id, module.id, {
                status: ListingStatus.APPROVED,
                condition: 'good',
                price: 45.00,
                annotation_level: 'light',
                title: 'Matching Listing'
            });
            await createTestListing(user.id, book.id, module.id, {
                status: ListingStatus.APPROVED,
                condition: 'new',
                price: 55.00,
                annotation_level: 'heavy',
                title: 'Non-Matching Listing'
            });

            const response = await request(app.getHttpServer())
                .get('/listings?condition=good&priceMin=40&priceMax=50&annotationLevel=light')
                .expect(200);

            expect(response.body).toHaveLength(1);
            expect(response.body[0].title).toBe('Matching Listing');
        });
    });
});