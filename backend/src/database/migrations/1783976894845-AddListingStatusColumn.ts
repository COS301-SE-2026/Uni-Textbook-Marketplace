import { MigrationInterface, QueryRunner } from "typeorm";

export class AddListingStatusColumn1783976894845 implements MigrationInterface {
    name = 'AddListingStatusColumn1783976894845';

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(
            `CREATE TYPE "public"."listings_listing_status_enum" AS ENUM('AVAILABLE','RESERVED','SOLD','WITHDRAWN')`,
        );
        await queryRunner.query(
            `ALTER TABLE "listings" ADD COLUMN "listing_status" "public"."listings_listing_status_enum" NOT NULL DEFAULT 'AVAILABLE'`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "listings" DROP COLUMN "listing_status"`);
        await queryRunner.query(`DROP TYPE "public"."listings_listing_status_enum"`);
    }

}
