import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import { DataSource } from "typeorm";


describe('listing (e2e) test', () => {

    let app: INestApplication;
    let dataSource: DataSource;

    beforeAll(async () => {

        const moduleRef = await Test.createTestingModule({
            imports: [AppModule]
        }).compile();

        app = moduleRef.createNestApplication();
        await app.init();

        dataSource = moduleRef.get(DataSource);
    });

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    })

    describe('test connetion', () => {
        it('should load app', () => {
            expect(true).toBe(true);
        });
    });
});