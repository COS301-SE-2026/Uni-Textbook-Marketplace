import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';

import { DataSource, Repository } from 'typeorm';

import request from 'supertest';
import cookieParser from 'cookie-parser';

import { EMAIL_SERVICE } from '../src/email/email.interface';

import { University } from '../src/database/entities/university.entity';
import { User } from '../src/database/entities/users.entity';

import { Faculty } from "../src/database/entities/faculty.entity";

import { db } from '../src/firebase/firebase-admin';

describe("Messaging e2e testing",() =>{
    const Test_Password = process.env.TEST_PASSWORD;
    const INVALID_UUID = "invalid";
    let app!: INestApplication;
    let dataSource!: DataSource;

    let universityRepository!: Repository<University>;
    let userRepository!: Repository<User>;

    let sellerToken!: string;
    let buyerToken!: string;


    let listingId!: string;
    let conversationId!: string;

    let facultyRepo: Repository<Faculty>;

    // ---------- shared request helpers ----------
    // Every route below authenticates via the "access_token" cookie except
    // module creation, which uses a Bearer header (kept as-is, unchanged).

    const auth = (token: string) => ({
        Cookie: `access_token=${token}`,
    });

    const authGet = (url: string, token?: string) => {
        const req = request(app.getHttpServer()).get(url);
        return token ? req.set(auth(token)) : req;
    };

    const authPost = (url: string, token?: string, body: object = {}) => {
        const req = request(app.getHttpServer()).post(url).send(body);
        return token ? req.set(auth(token)) : req;
    };

    const bearerPost = (url: string, token: string, body: object = {}) =>
        request(app.getHttpServer())
            .post(url)
            .set("Authorization", `Bearer ${token}`)
            .send(body);

    //helper functions
    const createUniversity = () => {
        return universityRepository.save({
            name: "University of Pretoria",
            email_domain: "tuks.co.za",
        });
    };

    const registerUser = (
        email: string,
        firstName: string,
        lastName: string,
        universityId: string,
    ) => {
        return authPost("/auth/register", undefined, {
            email,
            password: Test_Password,
            first_name: firstName,
            last_name: lastName,
            faculty: "EBIT",
            university_id: universityId,
        }).expect(201);
    };

    const verifyUser = async (email: string) => {
        await userRepository.update(
            { email },
            { is_verified: true },
        );
    };

    const login = async (email: string): Promise<string> => {
        const res = await authPost("/auth/login", undefined, {
            email,
            password: Test_Password,
        }).expect(200);

        const cookies = Array.isArray(res.headers["set-cookie"])
            ? res.headers["set-cookie"]
            : [];
        const accessTokenCookie = cookies.find(cookie =>
            cookie.startsWith("access_token="),
        );

        if (!accessTokenCookie) {
            throw new Error("Access token cookie not found.");
        }

        return accessTokenCookie.split(";")[0].split("=")[1];
    };

    const createFaculty = async (universityId: string): Promise<string> => {
        const faculty = await facultyRepo.save({
            name: "EBIT",
            university: { id: universityId },
        });

        return faculty.id;
    };

    const createModule = async (
        universityId: string,
        facultyId: string,
        sellerToken: string,
    ): Promise<string> => {
        const res = await bearerPost("/modules", sellerToken, {
            code: "COS301",
            name: "software",
            semester: 1,
            university_id: universityId,
            faculty_id: facultyId,
        }).expect(201);

        return res.body.id;
    };

    const createBook = async (): Promise<string> => {
        const res = await authPost("/books", undefined, {
            isbn: "978013468599",
            title: "Software Engineering",
            author: "gift",
            edition: 3,
            publisher: "nexusdev",
        }).expect(201);
        return res.body.id;
    };

    const createListing = async (
        token: string,
        moduleId: string,
        bookId: string,
    ): Promise<string> => {
        const res = await authPost("/listings", token, {
            title: "Messaging Test Listing",
            bookId,
            moduleId,
            condition: "good",
            annotationLevel: "light",
            price: 100,
            photoUrls: [],
            hasNotes: false,
        }).expect(201);

        return res.body.id;
    };

    const createConversation = (
        token: string,
        listing: string = listingId,
    ) => authPost("/conversations", token, { listingId: listing });

    const sendMessage = (
        token: string,
        conversation: string,
        text: string,
    ) => authPost(`/conversations/${conversation}/messages`, token, { text });

    const getMessages = (conversation: string, token?: string) =>
        authGet(`/conversations/${conversation}/messages`, token);

    const getMyConversations = (token?: string) =>
        authGet("/conversations/mine", token);

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
        facultyRepo = dataSource.getRepository(Faculty);

        // Create university
        const university = await createUniversity();
        const facultyId = await createFaculty(university.id);

        // Register , verify and login users
        await registerUser(
            "seller@tuks.co.za",
            "Jon",
            "Seller",
            university.id,
        );

        await registerUser(
            "buyer@tuks.co.za",
            "Jane",
            "Buyer",
            university.id,
        );
        await Promise.all([
            verifyUser("seller@tuks.co.za"),
            verifyUser("buyer@tuks.co.za"),
        ]);
        sellerToken = await login("seller@tuks.co.za");
        buyerToken = await login("buyer@tuks.co.za");



        //create listing
        const moduleId = await createModule(
            university.id,
            facultyId,
            sellerToken,
        );
        const bookId = await createBook();
        listingId = await createListing(
            sellerToken,
            moduleId,
            bookId,
        );
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

    describe("test connection", () => {
        it("should load app", () => {
            expect(true).toBe(true);
        });
    });

    //testing conversation create
    describe("create conversation", () => {

        //Happy test
        it("should create a conversation for a listing", async () => {
            const res = await createConversation(buyerToken).expect(201);
            expect(res.body).toHaveProperty("conversationId");
            expect(res.body.alreadyExists).toBe(false);
            conversationId = res.body.conversationId;
        });


        //alresdy exiust
        it("Should return true for already exists", async() =>{
            //create first one
            await createConversation(buyerToken);

            //get the duplicate conversatyion
            const res = await createConversation(buyerToken).expect(201);

            expect(res.body).toHaveProperty("conversationId");
            expect(res.body.alreadyExists).toBe(true);
            conversationId = res.body.conversationId;
        })

        //self
        it("Should return 403", async() =>{
            await createConversation(sellerToken).expect(403);
        })

        //unauth
        it("Should return a 401 error", async()=>{
            const res = await authPost("/conversations", undefined, {
                listingId,
            });
            expect(res.status).toBe(401);
        })

    });


    //GET my conversations
    describe("get my conversations", () => {
        //happy test
        it("should return the buyer's conversations", async () => {

            const res = await getMyConversations(buyerToken).expect(200);

            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);

            expect(res.body[0]).toHaveProperty("conversationId");
            expect(res.body[0]).toHaveProperty("listing");
            expect(res.body[0]).toHaveProperty("otherUser");
            expect(res.body[0].conversationId).toBe(conversationId);
        });

        it("should return 401 when not logged in", async () => {

            await getMyConversations().expect(401);
        });
    });

    //POST message
    describe("send message", () => {
        //happy test
        it("should send a message", async () => {

            const res = await sendMessage(
                buyerToken,
                conversationId,
                "Hello seller!",
            ).expect(201);

            expect(res.body).toHaveProperty("messageId");
            expect(res.body.message).toBe(
                "Message sent successfully.",
            );

        });

        //unhappy test
        it("should return 404 for an invalid conversation", async () => {

            await sendMessage(
                buyerToken,
                INVALID_UUID,
                "Hello",
            ).expect(404);
        });

        it("should return 401 for no access", async()=> {
            await sendMessage("nope", "001112212", "Hello").expect(401);
        });
    })

    //Get conversation id messages
    describe("get messages", () => {
        //happy path
        it("should return all messages", async () => {

            const res = await getMessages(conversationId, buyerToken).expect(200);

            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);

            expect(res.body[0].text).toBe("Hello seller!");
            expect(res.body[0]).toHaveProperty("senderId");

        });

        //unhappy path
        it("should return 404 for an invalid conversation", async () => {

            await getMessages("0054345", buyerToken).expect(404);

        });

        //no access
        it("should return 401 for no access", async ()=>{
            await getMessages(conversationId).expect(401);
        });
    });

});
