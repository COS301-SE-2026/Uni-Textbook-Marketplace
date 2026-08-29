import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBannedToUsers1787956769774 implements MigrationInterface {
    name = 'AddBannedToUsers1787956769774'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "saved_searches" DROP CONSTRAINT "saved_searches_user_id_fkey"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_saved_search_user"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_saved_search_created_at"`);
        await queryRunner.query(`ALTER TABLE "listings" DROP CONSTRAINT IF EXISTS "listings_condition_check"`);
        await queryRunner.query(`ALTER TABLE "listings" DROP CONSTRAINT IF EXISTS "listings_annotation_level_check"`);
        await queryRunner.query(`ALTER TABLE "listings" DROP CONSTRAINT IF EXISTS "listings_price_check"`);
        await queryRunner.query(`ALTER TABLE "listings" DROP CONSTRAINT IF EXISTS "listings_status_check"`);
        await queryRunner.query(`ALTER TABLE "audit_log" DROP CONSTRAINT "audit_log_action_check"`);
        await queryRunner.query(`CREATE TYPE "public"."reports_status_enum" AS ENUM('PENDING', 'REVIEWED')`);
        await queryRunner.query(`CREATE TABLE "reports" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "reason" text NOT NULL, "status" "public"."reports_status_enum" NOT NULL DEFAULT 'PENDING', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "reporter_id" uuid NOT NULL, "listing_id" uuid NOT NULL, CONSTRAINT "PK_d9013193989303580053c0b5ef6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "is_read" boolean NOT NULL DEFAULT false, "entity_type" character varying NOT NULL, "message_info" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "notification_from" uuid, "entity_id" uuid, CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ADD "is_banned" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ADD "banned_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "users" ADD "ban_reason" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD "banned_by" uuid`);
        await queryRunner.query(`ALTER TABLE "saved_searches" ALTER COLUMN "created_at" SET NOT NULL`);
        await queryRunner.query(`CREATE INDEX "idx_books_title" ON "books" ("title") `);
        await queryRunner.query(`CREATE INDEX "idx_saved_searches_created_at" ON "saved_searches" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "idx_saved_searches_user_id" ON "saved_searches" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "audit_log" ADD CONSTRAINT "CHK_61df26bb3e1e64395385850cb4" CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'SOLD', 'WITHDRAWN','APPROVE_LISTING','REJECT_LISTING','BAN_USER'))`);
        await queryRunner.query(`ALTER TABLE "reports" ADD CONSTRAINT "FK_9459b9bf907a3807ef7143d2ead" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reports" ADD CONSTRAINT "FK_d1cdc1ed639c70f2ec0bc33e166" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_e10aa79b34032d2fce0a6c59176" FOREIGN KEY ("banned_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "saved_searches" ADD CONSTRAINT "FK_8f01d13ac8e7b451d244674274f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_9a8a82462cab47c73d25f49261f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_2b493a038e4fd0ea954648d6b44" FOREIGN KEY ("notification_from") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_39dccc777268995087ce0ccd626" FOREIGN KEY ("entity_id") REFERENCES "listings"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_39dccc777268995087ce0ccd626"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_2b493a038e4fd0ea954648d6b44"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_9a8a82462cab47c73d25f49261f"`);
        await queryRunner.query(`ALTER TABLE "saved_searches" DROP CONSTRAINT "FK_8f01d13ac8e7b451d244674274f"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_e10aa79b34032d2fce0a6c59176"`);
        await queryRunner.query(`ALTER TABLE "reports" DROP CONSTRAINT "FK_d1cdc1ed639c70f2ec0bc33e166"`);
        await queryRunner.query(`ALTER TABLE "reports" DROP CONSTRAINT "FK_9459b9bf907a3807ef7143d2ead"`);
        await queryRunner.query(`ALTER TABLE "audit_log" DROP CONSTRAINT "CHK_61df26bb3e1e64395385850cb4"`);
        await queryRunner.query(`DROP INDEX "public"."idx_saved_searches_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_saved_searches_created_at"`);
        await queryRunner.query(`DROP INDEX "public"."idx_books_title"`);
        await queryRunner.query(`ALTER TABLE "saved_searches" ALTER COLUMN "created_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "banned_by"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "ban_reason"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "banned_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_banned"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TABLE "reports"`);
        await queryRunner.query(`DROP TYPE "public"."reports_status_enum"`);
        await queryRunner.query(`ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_action_check" CHECK (((action)::text = ANY ((ARRAY['CREATE'::character varying, 'UPDATE'::character varying, 'DELETE'::character varying, 'LOGIN'::character varying, 'LOGOUT'::character varying, 'SOLD'::character varying, 'WITHDRAWN'::character varying, 'APPROVE_LISTING'::character varying, 'REJECT_LISTING'::character varying])::text[])))`);
        await queryRunner.query(`ALTER TABLE "listings" ADD CONSTRAINT "listings_status_check" CHECK ((status = ANY (ARRAY['PENDING'::listings_status_enum, 'APPROVED'::listings_status_enum, 'REJECTED'::listings_status_enum, 'SOFT_DELETED'::listings_status_enum])))`);
        await queryRunner.query(`ALTER TABLE "listings" ADD CONSTRAINT "listings_price_check" CHECK ((price >= (0)::numeric))`);
        await queryRunner.query(`ALTER TABLE "listings" ADD CONSTRAINT "listings_annotation_level_check" CHECK ((annotation_level = ANY (ARRAY['none'::listings_annotation_level_enum, 'light'::listings_annotation_level_enum, 'heavy'::listings_annotation_level_enum])))`);
        await queryRunner.query(`ALTER TABLE "listings" ADD CONSTRAINT "listings_condition_check" CHECK ((condition = ANY (ARRAY['new'::listings_condition_enum, 'good'::listings_condition_enum, 'fair'::listings_condition_enum, 'poor'::listings_condition_enum])))`);
        await queryRunner.query(`CREATE INDEX "idx_saved_search_created_at" ON "saved_searches" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "idx_saved_search_user" ON "saved_searches" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "saved_searches" ADD CONSTRAINT "saved_searches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
