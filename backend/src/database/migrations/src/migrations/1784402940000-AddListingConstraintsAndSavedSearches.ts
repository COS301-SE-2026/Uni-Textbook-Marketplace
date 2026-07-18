import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddListingConstraintsAndSavedSearches implements MigrationInterface {
  name = 'AddListingConstraintsAndSavedSearches';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add CHECK constraint for condition
    await queryRunner.query(`
      ALTER TABLE "listings" DROP CONSTRAINT IF EXISTS "listings_condition_check"
    `);
    await queryRunner.query(`
      ALTER TABLE "listings" 
      ADD CONSTRAINT "listings_condition_check" 
      CHECK ("condition" IN ('new', 'good', 'fair', 'poor'))
    `);

    // Add CHECK constraint for annotation_level
    await queryRunner.query(`
      ALTER TABLE "listings" DROP CONSTRAINT IF EXISTS "listings_annotation_level_check"
    `);
    await queryRunner.query(`
      ALTER TABLE "listings" 
      ADD CONSTRAINT "listings_annotation_level_check" 
      CHECK ("annotation_level" IN ('none', 'light', 'heavy'))
    `);

    // Add CHECK constraint for price >= 0
    await queryRunner.query(`
      ALTER TABLE "listings" DROP CONSTRAINT IF EXISTS "listings_price_check"
    `);
    await queryRunner.query(`
      ALTER TABLE "listings" 
      ADD CONSTRAINT "listings_price_check" 
      CHECK ("price" >= 0)
    `);

    // Add CHECK constraint for status
    await queryRunner.query(`
      ALTER TABLE "listings" DROP CONSTRAINT IF EXISTS "listings_status_check"
    `);
    await queryRunner.query(`
      ALTER TABLE "listings" 
      ADD CONSTRAINT "listings_status_check" 
      CHECK ("status" IN ('PENDING', 'APPROVED', 'REJECTED', 'SOFT_DELETED'))
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "saved_searches" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "filter_json" JSONB NOT NULL,
        "created_at" TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Create indexes for saved_searches
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_saved_search_user" 
      ON "saved_searches" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_saved_search_created_at" 
      ON "saved_searches" ("created_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "saved_searches"
    `);

    await queryRunner.query(`
      ALTER TABLE "listings" DROP CONSTRAINT IF EXISTS "listings_condition_check"
    `);
    await queryRunner.query(`
      ALTER TABLE "listings" DROP CONSTRAINT IF EXISTS "listings_annotation_level_check"
    `);
    await queryRunner.query(`
      ALTER TABLE "listings" DROP CONSTRAINT IF EXISTS "listings_price_check"
    `);
    await queryRunner.query(`
      ALTER TABLE "listings" DROP CONSTRAINT IF EXISTS "listings_status_check"
    `);
  }
}
