import { MigrationInterface, QueryRunner } from "typeorm";

export class AuctionTables1789780041190 implements MigrationInterface {
    name = 'AuctionTables1789780041190'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "auction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "starting_price" numeric(10,2) NOT NULL, "reserve_price" numeric(10,2), "current_highest_bid" numeric(10,2), "start_time" TIMESTAMP WITH TIME ZONE, "end_time" TIMESTAMP WITH TIME ZONE, "status" "public"."auction_status_enum" NOT NULL DEFAULT 'SCHEDULED', "extension_count" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "listing_id" uuid, "seller_id" uuid, "current_highest_bidder_id" uuid, CONSTRAINT "PK_9dc876c629273e71646cf6dfa67" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_auction_status_endtime" ON "auction" ("status", "end_time") `);
        await queryRunner.query(`CREATE TABLE "bid" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "amount" numeric(10,2) NOT NULL, "placed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "status" "public"."bid_status_enum" NOT NULL, "rejection_reason" text, "auction_id" uuid, "bidder_id" uuid, CONSTRAINT "PK_ed405dda320051aca2dcb1a50bb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_bid_auction_id" ON "bid" ("auction_id") `);
        await queryRunner.query(`ALTER TABLE "auction" ADD CONSTRAINT "FK_ef46af000da05ffbf7b50d69577" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "auction" ADD CONSTRAINT "FK_3d6291a6a8071165fa8cd768749" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "auction" ADD CONSTRAINT "FK_630cae6c4972af6515822ff9bd1" FOREIGN KEY ("current_highest_bidder_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bid" ADD CONSTRAINT "FK_9e594e5a61c0f3cb25679f6ba8d" FOREIGN KEY ("auction_id") REFERENCES "auction"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bid" ADD CONSTRAINT "FK_e7618559409a903a897164156b7" FOREIGN KEY ("bidder_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bid" DROP CONSTRAINT "FK_e7618559409a903a897164156b7"`);
        await queryRunner.query(`ALTER TABLE "bid" DROP CONSTRAINT "FK_9e594e5a61c0f3cb25679f6ba8d"`);
        await queryRunner.query(`ALTER TABLE "auction" DROP CONSTRAINT "FK_630cae6c4972af6515822ff9bd1"`);
        await queryRunner.query(`ALTER TABLE "auction" DROP CONSTRAINT "FK_3d6291a6a8071165fa8cd768749"`);
        await queryRunner.query(`ALTER TABLE "auction" DROP CONSTRAINT "FK_ef46af000da05ffbf7b50d69577"`);
        await queryRunner.query(`DROP INDEX "public"."idx_bid_auction_id"`);
        await queryRunner.query(`DROP TABLE "bid"`);
        await queryRunner.query(`DROP INDEX "public"."idx_auction_status_endtime"`);
        await queryRunner.query(`DROP TABLE "auction"`);
    }

}
