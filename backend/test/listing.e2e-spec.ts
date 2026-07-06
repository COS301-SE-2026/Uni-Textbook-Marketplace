import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import { DataSource, Repository } from "typeorm";
import { University } from "../src/database/entities/university.entity";
import { User } from "../src/database/entities/users.entity";
import request from "supertest";
import { EMAIL_SERVICE } from "../src/email/email.interface";
import { Module } from "../src/database/entities/module.entity";
import cookieParser from 'cookie-parser';

const Test_Password = process.env.TEST_PASSWORD;

describe("listing (e2e) test", () => {
    let app!: INestApplication;
    let dataSource!: DataSource;
    let universityRepository!: Repository<University>;
    let userRepository!: Repository<User>;
    let moduleRepository!: Repository<Module>;

    const createUniversity = () => {
        return universityRepository.save({
            name: "University of Pretoria",
            email_domain: "tuks.co.za",
        });
    };

    const registerStudent = (universityId: string) => {
        return request(app.getHttpServer())
            .post("/auth/register")
            .send({
                email: "u1234598@tuks.co.za",
                password: Test_Password,
                first_name: "gift",
                last_name: "mohub",
                faculty: "EBIT",
                university_id: universityId,
            })
            .expect(201);
    };

    const verifyUser = async (email: string) => {
        await userRepository.update({ email }, { is_verified: true });
    };

    const loginVerifiedStudent = async (): Promise<string> => {
        const res = await request(app.getHttpServer())
            .post("/auth/login")
            .send({
                email: "u1234598@tuks.co.za",
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
    });

    afterAll(async () => {
        
        if(dataSource?.isInitialized){
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

    describe("create listing", () => {

        it("should allow verified user to create listing", async () => {

            const university = await createUniversity();
            await registerStudent(university.id);
            await verifyUser("u1234598@tuks.co.za");
            const token = await loginVerifiedStudent();

            const moduleId = await createModule(university.id);
            const bookId = await createBook();

            const res = await request(app.getHttpServer())
                .post("/listings")
                .set("Cookie", `access_token=${token}`)
                .send({
                    title: "Test Listing",
                    bookId: bookId,
                    moduleId: moduleId,
                    condition: "good",
                    annotationLevel: "light",
                    price: 100,
                    photoUrls: [],
                    hasNotes: false,
                });

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("id");
            expect(res.body.title).toBe("Test Listing");
        });
    });

    describe("get mine listing", () => {

        it("should return my listing", async () => {

            const token = await loginVerifiedStudent();

            const res = await request(app.getHttpServer())
                .get("/listings/mine")
                .set("Cookie", `access_token=${token}`)
                .expect(200);

            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body[0]).toHaveProperty("title", "Test Listing");
        });
    });
});