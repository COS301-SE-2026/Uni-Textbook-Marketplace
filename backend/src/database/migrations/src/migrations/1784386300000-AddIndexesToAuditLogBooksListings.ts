import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexesToAuditLogBooksListings implements MigrationInterface {
  name = 'AddIndexesToAuditLogBooksListings';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Index for entity_type and entity_id
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_audit_entity" 
      ON "audit_log" ("entity_type", "entity_id")
    `);

    // Index for performed_at
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_audit_created_at" 
      ON "audit_log" ("performed_at")
    `);

    // Drop existing CHECK constraint if it exists
    await queryRunner.query(`
      ALTER TABLE "audit_log" DROP CONSTRAINT IF EXISTS "audit_log_action_check"
    `);

    // Add the new CHECK constraint with SOLD and WITHDRAWN
    await queryRunner.query(`
      ALTER TABLE "audit_log" 
      ADD CONSTRAINT "audit_log_action_check" 
      CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'SOLD', 'WITHDRAWN'))
    `);

    // Index for ISBN (for fast lookup by ISBN)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_books_isbn" 
      ON "books" ("isbn")
    `);

    // Index for author and title (for search queries)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_books_author_title" 
      ON "books" ("author", "title")
    `);

    // Index for edition (for filtering by edition)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_books_edition" 
      ON "books" ("edition")
    `);

    // Index for module and price (for filtering by module and sorting by price)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_listings_module_price" 
      ON "listings" ("module", "price")
    `);

    // Index for condition (for filtering by condition)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_listings_condition" 
      ON "listings" ("condition")
    `);

    // Index for annotation level (for filtering by annotation level)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_listings_annotation" 
      ON "listings" ("annotation_level")
    `);

    // Index for status (for filtering by status)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_listing_status" 
      ON "listings" ("status")
    `);

    // Index for seller (for finding all listings by a seller)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_listing_seller" 
      ON "listings" ("seller_id")
    `);

    // Index for reviewer (for finding listings reviewed by a specific admin)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_listing_reviewed_by" 
      ON "listings" ("reviewed_by")
    `);

    // Index for created_at (for sorting by date)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_listings_created_at" 
      ON "listings" ("created_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_audit_entity"
    `);
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_audit_created_at"
    `);
    await queryRunner.query(`
      ALTER TABLE "audit_log" DROP CONSTRAINT IF EXISTS "audit_log_action_check"
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_books_isbn"
    `);
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_books_author_title"
    `);
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_books_edition"
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_listings_module_price"
    `);
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_listings_condition"
    `);
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_listings_annotation"
    `);
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_listing_status"
    `);
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_listing_seller"
    `);
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_listing_reviewed_by"
    `);
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_listings_created_at"
    `);
  }
}
