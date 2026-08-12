import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { TestModule } from "./test.module";;
import { DataSource, Repository } from "typeorm";
import request from "supertest";

import { University } from "../src/database/entities/university.entity";
import { User } from "../src/database/entities/users.entity";
import { EMAIL_SERVICE } from "../src/email/email.interface";

const Test_Password = process.env.TEST_PASSWORD;


describe('Auth (e2e) test', () => {

    let app: INestApplication;
    let dataSource: DataSource;
    let universityRepository: Repository<University>;
    let userRepository: Repository<User>

    //helpers
    const createUniversity = () => universityRepository.save({
        name: 'University of Pretoria',
        email_domain: 'tuks.co.za'
    });

    const registerStudent = (university_id: string, overrides = {}) =>
        request(app.getHttpServer())
            .post('/auth/register')
            .send({
                email: 'u1234598@tuks.co.za',
                password: Test_Password,
                first_name: 'gift',
                last_name: 'mohub',
                faculty: 'EBIT',
                university_id,
                ...overrides
            });

    const createVerifiedStudent = async (university_id: string) => {
        await registerStudent(university_id)
            .expect(201);
        await userRepository.update(
            { email: 'u1234598@tuks.co.za' },
            { is_verified: true }
        )
    }


    beforeAll(async () => {

        const moduleRef = await Test.createTestingModule({
            imports: [TestModule]
        })
            .overrideProvider(EMAIL_SERVICE)
            .useValue({
                sendOtp: jest.fn().mockResolvedValue(undefined)
            }).compile();

        app = moduleRef.createNestApplication();

        await app.init();

        dataSource = moduleRef.get(DataSource);
        universityRepository = dataSource.getRepository(University);
        userRepository = dataSource.getRepository(User);
    });

    afterEach(async () => {
        await dataSource.query(
            'TRUNCATE TABLE universities, users CASCADE'
        )
    });

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    })

    //for checking database connection
    describe('database', () => {
        it('should load app', () => {
            expect(true).toBe(true);
        });
    });

    describe('api/auth/register', () => {

        it('should reject registration when university does not exist', async () => {

            const response = await registerStudent('550e8400-e29b-41d4-a716-446655440000')
                .expect(400);

            expect(response.body).toBeDefined();
        });

        it('should reject email that does not match selected uni domain', async () => {

            const university = await createUniversity();

            const response = await registerStudent(university.id, {
                email: 'u1234598@tuks.com'
            })
                .expect(400);
            expect(response.body).toBeDefined();
        });

        it('should register a student sucessfully', async () => {

            const university = await createUniversity();

            const response = await registerStudent(university.id)
                .expect(201);

            expect(response.body).toBeDefined();
        }, 15000);

    })

    describe('/auth/login', () => {

        it('it should login a student', async () => {

            const university = await createUniversity();
            await createVerifiedStudent(university.id);


            const loginResponse = await request(app.getHttpServer())
                .post('/auth/login')
                .send({
                    email: `u1234598@tuks.co.za`,
                    password: Test_Password,
                })
                .expect(200);

            expect(loginResponse.body.message).toBe('Login successful.');
        });

    })


    describe('/auth/universities', () => {

        it('it should return list of unis', async () => {

            await createUniversity();

            const response = await request(app.getHttpServer())
                .get('/auth/universities')
                .expect(200);

            expect(response.body).toBeDefined();
            expect(response.body.length).toBeGreaterThan(0);
        });
    });
});