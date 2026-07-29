import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexesToAuditLogBooksListings1784386300000 implements MigrationInterface {
  private async createIndex(
    queryRunner: QueryRunner,
    name: string,
    table: string,
    columns: string[],
  ): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "${name}" 
      ON "${table}" (${columns.join(', ')})
    `);
  }

  private async dropIndex(
    queryRunner: QueryRunner,
    name: string,
  ): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "${name}"
    `);
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Audit log indexes
    await this.createIndex(queryRunner, 'idx_audit_entity', 'audit_log', [
      'entity_type',
      'entity_id',
    ]);
    await this.createIndex(queryRunner, 'idx_audit_created_at', 'audit_log', [
      'performed_at',
    ]);

    // Update audit_log CHECK constraint
    await queryRunner.query(`
      ALTER TABLE "audit_log" DROP CONSTRAINT IF EXISTS "audit_log_action_check"
    `);
    await queryRunner.query(`
      ALTER TABLE "audit_log" 
      ADD CONSTRAINT "audit_log_action_check" 
      CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'SOLD', 'WITHDRAWN','APPROVE_LISTING','REJECT_LISTING'))
    `);

    // Books indexes
    await this.createIndex(queryRunner, 'idx_books_isbn', 'books', ['isbn']);
    await this.createIndex(queryRunner, 'idx_books_author_title', 'books', [
      'author',
      'title',
    ]);
    await this.createIndex(queryRunner, 'idx_books_edition', 'books', [
      'edition',
    ]);

    // Listings indexes
    await this.createIndex(
      queryRunner,
      'idx_listings_module_price',
      'listings',
      ['module_id', 'price'],
    );
    await this.createIndex(queryRunner, 'idx_listings_condition', 'listings', [
      'condition',
    ]);
    await this.createIndex(queryRunner, 'idx_listings_annotation', 'listings', [
      'annotation_level',
    ]);
    await this.createIndex(queryRunner, 'idx_listing_status', 'listings', [
      'status',
    ]);
    await this.createIndex(queryRunner, 'idx_listing_seller', 'listings', [
      'seller_id',
    ]);
    await this.createIndex(queryRunner, 'idx_listing_reviewed_by', 'listings', [
      'reviewed_by',
    ]);
    await this.createIndex(queryRunner, 'idx_listings_created_at', 'listings', [
      'created_at',
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop audit log indexes
    await this.dropIndex(queryRunner, 'idx_audit_entity');
    await this.dropIndex(queryRunner, 'idx_audit_created_at');
    await queryRunner.query(`
      ALTER TABLE "audit_log" DROP CONSTRAINT IF EXISTS "audit_log_action_check"
    `);

    // Drop books indexes
    await this.dropIndex(queryRunner, 'idx_books_isbn');
    await this.dropIndex(queryRunner, 'idx_books_author_title');
    await this.dropIndex(queryRunner, 'idx_books_edition');

    // Drop listings indexes
    await this.dropIndex(queryRunner, 'idx_listings_module_price');
    await this.dropIndex(queryRunner, 'idx_listings_condition');
    await this.dropIndex(queryRunner, 'idx_listings_annotation');
    await this.dropIndex(queryRunner, 'idx_listing_status');
    await this.dropIndex(queryRunner, 'idx_listing_seller');
    await this.dropIndex(queryRunner, 'idx_listing_reviewed_by');
    await this.dropIndex(queryRunner, 'idx_listings_created_at');
  }
}
