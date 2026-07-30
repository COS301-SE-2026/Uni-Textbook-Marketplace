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
        if (dataSource?.isInitialized) {
            await dataSource.query(
                `TRUNCATE TABLE "listings", "otps", "modules","books", "users", "universities" RESTART IDENTITY CASCADE`
            )
        }

        if (app) {
            await app.close();
        }
    });
})