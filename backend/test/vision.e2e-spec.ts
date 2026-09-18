import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';

const TEST_STUDENT_EMAIL = process.env.TEST_STUDENT_EMAIL ?? 'student1@tuks.co.za';
const TEST_STUDENT_PASSWORD = process.env.TEST_STUDENT_PASSWORD ?? 'Password123';
const TEST_IMAGE_URL = process.env.TEST_IMAGE_URL ?? '';

describe('VisionController (e2e)', () => {
    let app: INestApplication;
    let accessCookie: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.use(cookieParser());
        app.useGlobalPipes(
            new ValidationPipe({ whitelist: true, transform: true }),
        );

        await app.init();

        const loginRes = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: TEST_STUDENT_EMAIL, password: TEST_STUDENT_PASSWORD });

        if (loginRes.status !== 200) {
            throw new Error(
                `Login Failed (${loginRes.status}): ${JSON.stringify(loginRes.body)}`,
            );
        }

        const rawCookies = loginRes.headers['set-cookie'];
        const cookies = Array.isArray(rawCookies) ? rawCookies : [rawCookies];

        accessCookie = cookies.find((c) => c.startsWith('access_token=')) ?? '';

        if (!accessCookie) {
            throw new Error(
                `No access_token cookie returned. Raw set-cookie: ${JSON.stringify(rawCookies)}`,
            );
        }
    }, 30000);

    it('POST /vision/extract-text -> 401 without auth', async () => {
        await request(app.getHttpServer())
            .post('/vision/extract-text')
            .send({ imageUrl: 'https://example.com/x.jpg'})
            .expect(401);
    });

    it('POST /vision/extract-text -> 400 on bad body', async () => {
        await request(app.getHttpServer())
            .post('/vision/extract-text')
            .set('Cookie', accessCookie)
            .send({ imageUrl: 'not-a-url'})
            .expect(400);
    });

    it('POST /vision/extract-text -> returns OCR text for a real image', async () => {
        if (!TEST_IMAGE_URL) {
            console.warn('Skipping real-image test: TEST_IMAGE_URL not set.');
            return;
        }

        const res = await request(app.getHttpServer())
            .post('/vision/extract-text')
            .set('Cookie', accessCookie)
            .send({ imageUrl: TEST_IMAGE_URL });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('rawText');
        expect(typeof res.body.rawText).toBe('string');
        expect(res.body.rawText.length).toBeGreaterThan(0);
        expect(res.body).toHaveProperty('matchedBook');
    }, 30000);
});