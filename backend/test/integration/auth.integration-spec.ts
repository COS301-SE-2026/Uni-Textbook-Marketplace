import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { AppModule } from "../../src/app.module";
import { DataSource } from "typeorm";


describe('Auth Integration', () => {

    let app : INestApplication;
    let dataSource : DataSource

    beforeAll(async () => {
        
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule]
        }).compile();

        app = moduleRef.createNestApplication();

        await app.init();

        dataSource = moduleRef.get(DataSource);
    });

    afterEach(async () => {
        await dataSource.query(
            'TRUNCATE TABLE users CASCADE'
        )
    });

    afterAll(async () => {
        if(app){
            await app.close();
        }
    })

    describe('database', () => {
        it('should load app', () =>{
            expect(true).toBe(true);
        });
    });
});