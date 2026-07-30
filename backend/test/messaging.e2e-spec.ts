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

    //testing conversation create
    describe("create conversation", async () => {
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

        //Happy test
        it("should create a conversation for a listing", async () => {
        
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

        //invalid listing
        it("should not create a new conversation",async () =>{
            const res = await request(app.getHttpServer())
                .post("/conversations")
                .set("Cookie", `access_token=${buyerToken}`)
                .send({
                    listingId: "00000000-0000-0000-0000-000000000000",
                });
            expect(res.status).toBe(404);
            conversationId = res.body.conversationId;
        })

        //alresdy exiust
        it("Should return true for already exists", async() =>{
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
            expect(res.body.alreadyExists).toBe(true);
            conversationId = res.body.conversationId;
        })

        //self
        it("Should return 500", async() =>{
            const res = await request(app.getHttpServer())
                .post("/conversations")
                .set("Cookie", `access_token=${buyerToken}`)
                .send({
                    listingId,
                });
            expect(res.status).toBe(500);
        })

        //unauth
        it("Should return a 401 error", async()=>{
            const res = await request(app.getHttpServer())
                .post("/conversations")
                //.set("Cookie", `access_token=${buyerToken}`)
                .send({
                    listingId,
                });
            expect(res.status).toBe(401);
        })

    });


    //GET my conversations
    describe("get my conversations", () => {
        //happy test
        it("should return the buyer's conversations", async () => {

            const res = await request(app.getHttpServer())
                .get("/conversations/mine")
                .set("Cookie", `access_token=${buyerToken}`)
                .expect(200);

            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);

            expect(res.body[0]).toHaveProperty("conversationId");
            expect(res.body[0]).toHaveProperty("listing");
            expect(res.body[0]).toHaveProperty("otherUser");
            expect(res.body[0].conversationId).toBe(conversationId);
        });

        it("should return 401 when not logged in", async () => {

            await request(app.getHttpServer())
                .get("/conversations/mine")
                .expect(401);
        });
    });

    //POST message
    describe("send message", () => {
        //happy test
        it("should send a message", async () => {

            const res = await request(app.getHttpServer())
                .post(`/conversations/${conversationId}/messages`)
                .set("Cookie", `access_token=${buyerToken}`)
                .send({
                    text: "Hello seller!",
                })
                .expect(201);

            expect(res.body).toHaveProperty("messageId");
            expect(res.body.message).toBe(
                "Message sent successfully.",
            );

        });

        //unhappy test
        it("should return 404 for an invalid conversation", async () => {

            await request(app.getHttpServer())
                .post("/conversations/00000000/messages")
                .set("Cookie", `access_token=${buyerToken}`)
                .send({
                    text: "Hello",
                })
                .expect(404);

        });
    })

});


