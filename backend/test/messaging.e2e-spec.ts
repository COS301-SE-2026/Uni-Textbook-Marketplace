import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';

import { DataSource, Repository } from 'typeorm';

import request from 'supertest';
import cookieParser from 'cookie-parser';

import { EMAIL_SERVICE } from '../src/email/email.interface';

import { University } from '../src/database/entities/university.entity';
import { User } from '../src/database/entities/users.entity';
import { Module } from '../src/database/entities/module.entity';
import { Book } from '../src/database/entities/book.entity';
import { Listing } from '../src/database/entities/listing.entity';

import { db } from '../src/firebase/firebase-admin';

describe("Messaging e2e testing",() =>{
    const Test_Password = process.env.TEST_PASSWORD;
    let app!: INestApplication;
    let dataSource!: DataSource;

    let universityRepository!: Repository<University>;
    let userRepository!: Repository<User>;
    let moduleRepository!: Repository<Module>;
    let bookRepository!: Repository<Book>;
    let listingRepository!: Repository<Listing>;

    let sellerToken!: string;
    let buyerToken!: string;

    let sellerId!: string;
    let buyerId!: string;

    let listingId!: string;
    let conversationId!: string;

    //helper functions
    const createUniversity = () => {
        return universityRepository.save({
            name: "University of Pretoria",
            email_domain: "tuks.co.za",
        });
    };

    const registerBuyer = (universityId: string) => {
        return request(app.getHttpServer())
            .post("/auth/register")
            .send({
                email: "buyer@tuks.co.za",
                password: Test_Password,
                first_name: "Jane",
                last_name: "Buyer",
                faculty: "EBIT",
                university_id: universityId,
            })
            .expect(201);
    };

    const registerSeller = (universityId: string) => {
        return request(app.getHttpServer())
            .post("/auth/register")
            .send({
                email: "seller@tuks.co.za",
                password: Test_Password,
                first_name: "Jon",
                last_name: "Seller",
                faculty: "EBIT",
                university_id: universityId,
            })
            .expect(201);
    };

    const verifyUser = async (email: string) => {
        await userRepository.update(
            { email },
            { is_verified: true },
        );
    };

    const loginVerifiedBuyer = async (): Promise<string> => {
        const res = await request(app.getHttpServer())
            .post("/auth/login")
            .send({
                email: "buyer@tuks.co.za",
                password: Test_Password,
            })
            .expect(200);
    
        const cookies = (res.headers['set-cookie'] ?? []) as unknown as string[];
        const accessTokenCookie = cookies.find((c) => c.startsWith('access_token='));
    
        if (!accessTokenCookie) {
            throw new Error('accessToken cookie not found in login response');
        }
    
        return accessTokenCookie.split(';')[0].split('=')[1];
    };
    
    const loginVerifiedSeller = async (): Promise<string> => {
        const res = await request(app.getHttpServer())
            .post("/auth/login")
            .send({
                email: "seller@tuks.co.za",
                password: Test_Password,
            })
            .expect(200);
    
        const cookies = (res.headers['set-cookie'] ?? []) as unknown as string[];
        const accessTokenCookie = cookies.find((c) => c.startsWith('access_token='));
    
        if (!accessTokenCookie) {
            throw new Error('accessToken cookie not found in login response');
        }
    
        return accessTokenCookie.split(';')[0].split('=')[1];
    };

    const createModule = async (universityId: string): Promise<string> => {
        const res = await request(app.getHttpServer())
            .post("/modules")
            .send({
                code: "COS301",
                name: "software",
                faculty: "EBIT",
                semester: 1,
                university_id: universityId,
             })
            .expect(201);

        return res.body.id;
    };

    const createBook = async (): Promise<string> => {
        const res = await request(app.getHttpServer())
            .post("/books")
            .send({
                isbn: "978013468599",
                title: "Software Engineering",
                author: "gift",
                edition: 3,
                publisher: "nexusdev"
            })
            .expect(201);
        return res.body.id;
    }

    const createListing = async (
        token: string,
        moduleId: string,
        bookId: string,
    ): Promise<string> => {

        const res = await request(app.getHttpServer())
            .post("/listings")
            .set("Cookie", `access_token=${token}`)
            .send({
                title: "Messaging Test Listing",
                bookId,
                moduleId,
                condition: "good",
                annotationLevel: "light",
                price: 100,
                photoUrls: [],
                hasNotes: false,
            })
            .expect(201);

        return res.body.id;
    };


    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(EMAIL_SERVICE)
            .useValue({
                sendOtp: jest.fn().mockResolvedValue(undefined),
            })
            .compile();

        app = moduleRef.createNestApplication();
        app.use(cookieParser());
        await app.init();

        dataSource = moduleRef.get(DataSource);
        universityRepository = dataSource.getRepository(University);
        userRepository = dataSource.getRepository(User);
        moduleRepository = dataSource.getRepository(Module);
        bookRepository = dataSource.getRepository(Book);
        listingRepository = dataSource.getRepository(Listing);
    });

    afterAll(async () => {
        const conversations = await db.collection('conversations').get();

        for (const conversation of conversations.docs) {

            // delet subcollection
            const messages = await conversation.ref.collection('messages').get();
            for (const message of messages.docs) {
                await message.ref.delete();
            }
            // delete the conversation document
            await conversation.ref.delete();
        }

        if (dataSource?.isInitialized) {
            await dataSource.query(
                `TRUNCATE TABLE "listings", "otps", "modules","books", "users", "universities" RESTART IDENTITY CASCADE`
            )
        }

        if (app) {
            await app.close();
        }
    });

    describe("test connetion", () => {
        it("should load app", () => {
            expect(true).toBe(true);
        });
    });

    //testing valid conversation start
    describe("create conversation", () => {
        it("should create a conversation for a listing", async () => {
            // Create university
            const university = await createUniversity();

            // Register , verify and login users
            await registerSeller(university.id);
            await registerBuyer(university.id);
            await verifyUser("seller@tuks.co.za");
            await verifyUser("buyer@tuks.co.za");
            sellerToken = await loginVerifiedSeller();
            buyerToken = await loginVerifiedBuyer();

            //create listing
            const moduleId = await createModule(university.id);
            const bookId = await createBook();
            listingId = await createListing(
                sellerToken,
                moduleId,
                bookId,
            );

            //create conversation
            const res = await request(app.getHttpServer())
                .post("/conversations")
                .set("Cookie", `access_token=${buyerToken}`)
                .send({
                    listingId,
                });
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("conversationId");
            expect(res.body.alreadyExists).toBe(false);
            conversationId = res.body.conversationId;
        });

    });

    //testing a conversation with a non listing
    describe("create conversation with nothing", ()=> {
        it("should not create a new conversation", async () =>{
            // Create university
            const university = await createUniversity();

            // Register , verify and login users
            await registerSeller(university.id);
            await registerBuyer(university.id);
            await verifyUser("seller@tuks.co.za");
            await verifyUser("buyer@tuks.co.za");
            sellerToken = await loginVerifiedSeller();
            buyerToken = await loginVerifiedBuyer();

            //create conversation
            const res = await request(app.getHttpServer())
                .post("/conversations")
                .set("Cookie", `access_token=${buyerToken}`)
                .send({
                    listingId: "00000000-0000-0000-0000-000000000000",
                });
            expect(res.status).toBe(404);
            conversationId = res.body.conversationId;
        })
    })

    //test a conversation tht already exists
    describe ("Converse in an already existing conversation", () =>{
        it("should return true", async() =>{
            // Create university
            const university = await createUniversity();

            // Register , verify and login users
            await registerSeller(university.id);
            await registerBuyer(university.id);
            await verifyUser("seller@tuks.co.za");
            await verifyUser("buyer@tuks.co.za");
            sellerToken = await loginVerifiedSeller();
            buyerToken = await loginVerifiedBuyer();

            //create listing
            const moduleId = await createModule(university.id);
            const bookId = await createBook();
            listingId = await createListing(
                sellerToken,
                moduleId,
                bookId,
            );

            //create first one
            const blah = await request(app.getHttpServer())
                .post("/conversations")
                .set("Cookie", `access_token=${buyerToken}`)
                .send({
                    listingId,
                });

            //get the duplicate conversatyion
            const res = await request(app.getHttpServer())
                .post("/conversations")
                .set("Cookie", `access_token=${buyerToken}`)
                .send({
                    listingId,
                });
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("conversationId");
            expect(res.body.alreadyExists).toBe(false);
            conversationId = res.body.conversationId;
        })
    })

})