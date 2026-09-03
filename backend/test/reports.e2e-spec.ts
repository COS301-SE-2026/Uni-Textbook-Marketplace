import './setup';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TestModule } from './test.module';
import { DataSource, Repository } from 'typeorm';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';

import {
    Listing,
    ListingStatus,
} from '../src/database/entities/listing.entity';
import { User } from '../src/database/entities/users.entity';
import { Book } from '../src/database/entities/book.entity';
import { Module as ModuleEntity } from '../src/database/entities/module.entity';
import { University } from '../src/database/entities/university.entity';
import { Faculty } from '../src/database/entities/faculty.entity';
import {
    Report,
    ReportStatus,
} from '../src/database/entities/report.entity';

jest.setTimeout(30000);

const Test_Password = process.env.TEST_PASSWORD || 'student@123';

describe('Reports E2E Tests', () => {
    let app: INestApplication;
    let dataSource: DataSource;

    let listingRepository: Repository<Listing>;
    let userRepository: Repository<User>;
    let bookRepository: Repository<Book>;
    let moduleRepository: Repository<ModuleEntity>;
    let universityRepository: Repository<University>;
    let facultyRepository: Repository<Faculty>;
    let reportRepository: Repository<Report>;

    let jwtService: JwtService;

    const getUniqueId = (): string => {
        return `${Date.now()}_${Math.random()
            .toString(36)
            .substring(2, 10)}`;
    };

    const createUniversity = async (): Promise<University> => {
        let university = await universityRepository.findOne({
            where: { email_domain: 'tuks.co.za' },
        });

        if (!university) {
            university = await universityRepository.save({
                name: 'University of Pretoria',
                email_domain: 'tuks.co.za',
            });
        }

        return university;
    };

    const createFaculty = async (
        universityId: string,
    ): Promise<Faculty> => {
        return facultyRepository.save({
            name: `EBIT ${getUniqueId()}`,
            university: { id: universityId },
        });
    };

    const createBook = async (): Promise<Book> => {
        return bookRepository.save({
            title: `Test Book ${getUniqueId()}`,
            isbn: `978013${Date.now()
                .toString()
                .slice(-6)}${Math.random()
                .toString(36)
                .substring(2, 4)}`,
            author: 'Test Author',
            edition: 3,
            publisher: 'Test Publisher',
        });
    };

    const createModule = async (): Promise<ModuleEntity> => {
        return moduleRepository.save({
            code: `COS${Date.now()
                .toString()
                .slice(-4)}${Math.random()
                .toString(36)
                .substring(2, 4)}`,
            name: `Imperative Programming ${getUniqueId()}`,
        });
    };

    const getUniqueEmail = (): string => {
        return `report_user_${getUniqueId()}@tuks.co.za`;
    };

    const createUser = async (): Promise<User> => {
        const university = await createUniversity();
        const faculty = await createFaculty(university.id);

        const email = getUniqueEmail();

        const registerPayload = {
            email,
            password: Test_Password,
            first_name: 'Report',
            last_name: 'Tester',
            university_id: university.id,
            faculty_id: faculty.id,
        };

        const response = await request(app.getHttpServer())
            .post('/auth/register')
            .send(registerPayload);

        if (response.status !== 201) {
            console.error(
                'Registration failed:',
                JSON.stringify(response.body, null, 2),
            );

            throw new Error(
                `Registration failed: ${response.status} - ${JSON.stringify(
                    response.body,
                )}`,
            );
        }

        await userRepository.update(
            { email },
            { is_verified: true },
        );

        const user = await userRepository.findOne({
            where: { email },
            relations: ['university', 'faculty'],
        });

        if (!user) {
            throw new Error(`User not found after creation: ${email}`);
        }

        return user;
    };

    const getAuthToken = (user: User): string => {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role || 'student',
        };

        return jwtService.sign(payload);
    };

    const createTestListing = async (
        sellerId: string,
        bookId: string,
        moduleId: string,
    ): Promise<Listing> => {
        return listingRepository.save({
            title: `Test Listing ${getUniqueId()}`,
            condition: 'good',
            annotation_level: 'light',
            price: 49.99,
            status: ListingStatus.APPROVED,
            seller: { id: sellerId },
            book: { id: bookId },
            module: { id: moduleId },
            photo_urls: ['http://example.com/photo.jpg'],
            has_notes: false,
        });
    };

    beforeAll(async () => {
        console.log('Setting up reports E2E tests...');

        const moduleRef = await Test.createTestingModule({
            imports: [TestModule],
        }).compile();

        app = moduleRef.createNestApplication();
        await app.init();

        dataSource = app.get(DataSource);

        listingRepository = dataSource.getRepository(Listing);
        userRepository = dataSource.getRepository(User);
        bookRepository = dataSource.getRepository(Book);
        moduleRepository = dataSource.getRepository(ModuleEntity);
        universityRepository = dataSource.getRepository(University);
        facultyRepository = dataSource.getRepository(Faculty);
        reportRepository = dataSource.getRepository(Report);

        jwtService = app.get(JwtService);

        const db = await dataSource.query(
            'SELECT current_database()',
        );

        console.log(
            'Connected to database:',
            db[0].current_database,
        );

        console.log('Reports E2E tests setup complete');
    }, 30000);

    afterEach(async () => {
        if (dataSource && dataSource.isInitialized) {
            try {
                await dataSource.query(
                    'TRUNCATE TABLE reports CASCADE',
                );

                await dataSource.query(
                    'TRUNCATE TABLE listings CASCADE',
                );

                await dataSource.query(
                    'TRUNCATE TABLE otps CASCADE',
                );

                await dataSource.query(
                    'TRUNCATE TABLE users CASCADE',
                );

                await dataSource.query(
                    'TRUNCATE TABLE books CASCADE',
                );

                await dataSource.query(
                    'TRUNCATE TABLE modules CASCADE',
                );

                await dataSource.query(
                    'TRUNCATE TABLE faculties CASCADE',
                );

                await dataSource.query(
                    'TRUNCATE TABLE universities CASCADE',
                );
            } catch (error) {
                console.error(
                    'Error in afterEach cleanup:',
                    error,
                );
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

    
});