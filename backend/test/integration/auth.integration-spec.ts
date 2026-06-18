import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { AppModule } from "../../src/app.module";
import { DataSource, Repository } from "typeorm";
import request from "supertest";

import { University } from "../../src/database/entities/university.entity";
import { User } from "../../src/database/entities/users.entity";


describe('Auth Integration', () => {

    let app : INestApplication;
    let dataSource : DataSource;
    let universityRepository : Repository<University>;
    let userRepository : Repository<User>

    beforeAll(async () => {
        
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule]
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
        if(app){
            await app.close();
        }
    })

    //for checking database connection
    describe('database', () => {
        it('should load app', () =>{
            expect(true).toBe(true);
        });
    });

    //api/auth/register
    it('should reject registration when university does not exist', async () =>{

        const response = await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                email: `test${Date.now()}@test.tuks.co.za`,
                password: 'student@123',
                first_name: 'gift',
                last_name: 'mohub',
                university_id: '550e8400-e29b-41d4-a716-446655440000',
                faculty: 'EBIT',
            })
            .expect(400);

        expect(response.body).toBeDefined();
    });

    it('should reject email that does not match selected uni domain', async () =>{

        const university = await universityRepository.save({
            name: 'University of Pretoria',
            email_domain: 'tuks.co.za'
        });

        const response = await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                email: `u1234598@tuks.com`,
                password: 'student@123',
                first_name: 'gift',
                last_name: 'mohub',
                university_id: university.id,
                faculty: 'EBIT',
            })
            .expect(400);

        expect(response.body).toBeDefined();
    });

    it('should register a student sucessfully', async () =>{
        
        const university = await universityRepository.save({
            name: 'University of Pretoria',
            email_domain: 'tuks.co.za'
        }); 

        const response = await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                email: `u1234598@tuks.co.za`,
                password: 'student@123',
                first_name: 'gift',
                last_name: 'mohub',
                university_id: university.id,
                faculty: 'EBIT',
            })
            .expect(201);

        expect(response.body).toBeDefined();
    },15000);

    
});