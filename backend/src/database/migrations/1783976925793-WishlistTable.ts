import { MigrationInterface, QueryRunner } from "typeorm";

export class WishlistTable1783976925793 implements MigrationInterface {
    name = 'WishlistTable1783976925793';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS "wishlist" ("user_id" uuid NOT NULL, "listings_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_wishlist_user_listings" PRIMARY KEY ("user_id","listings_id"))`,
        );

        await queryRunner.query(
            `DO $$ BEGIN
                ALTER TABLE "wishlist" ADD CONSTRAINT "FK_wishlist_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
                EXCEPTION WHEN duplicate_object THEN NULL;
            END $$;
            `
        );

        await queryRunner.query(
            `DO $$ BEGIN
                ALTER TABLE "wishlist" ADD CONSTRAINT "FK_wishlist_listing" FOREIGN KEY ("listings_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
                EXCEPTION WHEN duplicate_object THEN NULL;
            END $$;
            `
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wishlist" DROP CONSTRAINT IF EXISTS "FK_wishlist_listing"`);
        await queryRunner.query(`ALTER TABLE "wishlist" DROP CONSTRAINT IF EXISTS "FK_wishlist_user"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "wishlist"`);
    }

}
