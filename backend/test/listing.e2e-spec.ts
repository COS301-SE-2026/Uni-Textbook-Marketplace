import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { TestModule } from "./test.module";
import { DataSource, Repository } from "typeorm";
import { University } from "../src/database/entities/university.entity";
import { User } from "../src/database/entities/users.entity";
import { Faculty } from "../src/database/entities/faculty.entity";
import request from "supertest";
import { EMAIL_SERVICE } from "../src/email/email.interface";
import { Module } from "../src/database/entities/module.entity";
import cookieParser from 'cookie-parser';

const Test_Password = process.env.TEST_PASSWORD || 'student@123';

describe("listing (e2e) test", () => {
    let app!: INestApplication;
    let dataSource!: DataSource;
    let universityRepository!: Repository<University>;
    let userRepository!: Repository<User>;
    let moduleRepository!: Repository<Module>;
    let facultyRepository!: Repository<Faculty>;

    let userToken!: string;
    let createdListingId!: string;

    const createUniversity = () => {
        return universityRepository.save({
            name: "University of Pretoria",
            email_domain: "tuks.co.za",
        });
    };

    const createFaculty = async (universityId: string): Promise<string> => {
        const faculty = await facultyRepository.save({
            name: "EBIT",
            university: { id: universityId },
        });
        return faculty.id;
    };

    const registerStudent = (universityId: string, facultyId: string) => {
        return request(app.getHttpServer())
            .post("/auth/register")
            .send({
                email: "u1234598@tuks.co.za",
                password: Test_Password,
                first_name: "gift",
                last_name: "mohub",
                faculty_id: facultyId,
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

    const createModule = async (universityId: string, facultyId: string, token: string): Promise<string> => {
        const res = await request(app.getHttpServer())
            .post("/modules")
            .set('Authorization', `Bearer ${token}`)
            .send({
                code: "COS301",
                name: "software",
                semester: 1,
                university_id: universityId,
                faculty_id: facultyId,
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
            imports: [TestModule],
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
        facultyRepository = dataSource.getRepository(Faculty);
    }, 30000);

    afterAll(async () => {
        if (dataSource?.isInitialized) {
            await dataSource.query(
                `TRUNCATE TABLE "listings", "otps", "modules","books", "users", "universities", "faculties" RESTART IDENTITY CASCADE`
            );
        }

        if (app) {
            await app.close();
        }
    }, 10000);

    describe("test connection", () => {
        it("should load app", () => {
            expect(true).toBe(true);
        });
    });

    describe("create listing", () => {
        it("should allow verified user to create listing", async () => {
            const university = await createUniversity();
            const facultyId = await createFaculty(university.id);
            await registerStudent(university.id, facultyId);
            await verifyUser("u1234598@tuks.co.za");
            const token = await loginVerifiedStudent();
            userToken = token;
            const moduleId = await createModule(university.id, facultyId, token);
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
            createdListingId = res.body.id;
        });
    });

    describe("get mine listing", () => {
        it("should return my listing", async () => {
            const res = await request(app.getHttpServer())
                .get("/listings/mine")
                .set("Cookie", `access_token=${userToken}`)
                .expect(200);

            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThanOrEqual(1);
            expect(res.body[0]).toHaveProperty("title", "Test Listing");
        });
    });

    describe("get approved listing", () => {
        it("should not include a pending listings", async () => {
            const res = await request(app.getHttpServer())
                .get("/listings")
                .expect(200);

            expect(res.body).toHaveProperty("listings");
            expect(Array.isArray(res.body.listings)).toBe(true);
            expect(res.body.listings.some((l: any) => l.title === "Test Listing")).toBe(false);
        });
    });

    describe("get listing by id", () => {
        it("should return the listing", async () => {
            const res = await request(app.getHttpServer())
                .get(`/listings/${createdListingId}`)
                .expect(200);

            expect(res.body).toHaveProperty("id", createdListingId);
            expect(res.body.title).toBe("Test Listing");
        });

        it("should return 404 for id thats not there", async () => {
            await request(app.getHttpServer())
                .get("/listings/00000000-0000-0000-0000-000000000000")
                .expect(404);
        });
    });
});