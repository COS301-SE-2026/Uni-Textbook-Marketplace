import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserFacultyRelation1781798442984 implements MigrationInterface {
    name = 'UpdateUserFacultyRelation1781798442984'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "faculty" TO "faculty_id"`);
        await queryRunner.query(`CREATE TABLE "faculties" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "university_id" uuid NOT NULL, CONSTRAINT "UQ_39747c4153c669f1db683e8f231" UNIQUE ("name"), CONSTRAINT "PK_fd83e4a09c7182ccf7bdb3770b9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "faculty_id"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "faculty_id" uuid`);
        await queryRunner.query(`ALTER TABLE "faculties" ADD CONSTRAINT "FK_e7e42880536e292f61869f816cb" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_a0842240f363f156f8ee9377fad" FOREIGN KEY ("faculty_id") REFERENCES "faculties"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_a0842240f363f156f8ee9377fad"`);
        await queryRunner.query(`ALTER TABLE "faculties" DROP CONSTRAINT "FK_e7e42880536e292f61869f816cb"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "faculty_id"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "faculty_id" character varying`);
        await queryRunner.query(`DROP TABLE "faculties"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "faculty_id" TO "faculty"`);
    }

}
