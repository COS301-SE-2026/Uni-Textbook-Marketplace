import { MigrationInterface, QueryRunner } from "typeorm";

export class AuditlogFix1785246258477 implements MigrationInterface {
    name = 'AuditlogFix1785246258477'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_saved_search_user"`);
        await queryRunner.query(`DROP INDEX "public"."idx_saved_search_created_at"`);
        await queryRunner.query(`ALTER TABLE "listings" DROP CONSTRAINT "listings_condition_check"`);
        await queryRunner.query(`ALTER TABLE "listings" DROP CONSTRAINT "listings_annotation_level_check"`);
        await queryRunner.query(`ALTER TABLE "listings" DROP CONSTRAINT "listings_price_check"`);
        await queryRunner.query(`ALTER TABLE "listings" DROP CONSTRAINT "listings_status_check"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "listings" ADD CONSTRAINT "listings_status_check" CHECK ((status = ANY (ARRAY['PENDING'::listings_status_enum, 'APPROVED'::listings_status_enum, 'REJECTED'::listings_status_enum, 'SOFT_DELETED'::listings_status_enum])))`);
        await queryRunner.query(`ALTER TABLE "listings" ADD CONSTRAINT "listings_price_check" CHECK ((price >= (0)::numeric))`);
        await queryRunner.query(`ALTER TABLE "listings" ADD CONSTRAINT "listings_annotation_level_check" CHECK ((annotation_level = ANY (ARRAY['none'::listings_annotation_level_enum, 'light'::listings_annotation_level_enum, 'heavy'::listings_annotation_level_enum])))`);
        await queryRunner.query(`ALTER TABLE "listings" ADD CONSTRAINT "listings_condition_check" CHECK ((condition = ANY (ARRAY['new'::listings_condition_enum, 'good'::listings_condition_enum, 'fair'::listings_condition_enum, 'poor'::listings_condition_enum])))`);
        await queryRunner.query(`CREATE INDEX "idx_saved_search_created_at" ON "saved_searches" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "idx_saved_search_user" ON "saved_searches" ("user_id") `);
    }

}
