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
});