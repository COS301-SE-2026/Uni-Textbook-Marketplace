import { MigrationInterface, QueryRunner } from "typeorm";

export class AddModuleBook1789638388365 implements MigrationInterface {
    name = 'AddModuleBook1789638388365'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "module_books" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "module_id" uuid, "book_id" uuid, CONSTRAINT "UQ_ee677bff053235d1a0ebbdcfb90" UNIQUE ("module_id", "book_id"), CONSTRAINT "PK_240e6fb6641025aad0321fe41e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "module_books" ADD CONSTRAINT "FK_3db22c0abc46f6fce1c2d1b5081" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "module_books" ADD CONSTRAINT "FK_93db7b14a5e8773fd8315d201a4" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "module_books" DROP CONSTRAINT "FK_93db7b14a5e8773fd8315d201a4"`);
        await queryRunner.query(`ALTER TABLE "module_books" DROP CONSTRAINT "FK_3db22c0abc46f6fce1c2d1b5081"`);
        await queryRunner.query(`DROP TABLE "module_books"`);
    }

}
