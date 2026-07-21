import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddListingConstraintsAndSavedSearches implements MigrationInterface {
  name = 'AddListingConstraintsAndSavedSearches';

  private async addCheckConstraint(
    queryRunner: QueryRunner,
    table: string,
    constraint: string,
    check: string,
  ): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "${table}" DROP CONSTRAINT IF EXISTS "${constraint}"
    `);
    await queryRunner.query(`
      ALTER TABLE "${table}" 
      ADD CONSTRAINT "${constraint}" 
      CHECK (${check})
    `);
  }

  private async dropCheckConstraint(
    queryRunner: QueryRunner,
    table: string,
    constraint: string,
  ): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "${table}" DROP CONSTRAINT IF EXISTS "${constraint}"
    `);
  }

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

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add CHECK constraints for listings
    await this.addCheckConstraint(
      queryRunner,
      'listings',
      'listings_condition_check',
      "\"condition\" IN ('new', 'good', 'fair', 'poor')",
    );
    await this.addCheckConstraint(
      queryRunner,
      'listings',
      'listings_annotation_level_check',
      "\"annotation_level\" IN ('none', 'light', 'heavy')",
    );
    await this.addCheckConstraint(
      queryRunner,
      'listings',
      'listings_price_check',
      '"price" >= 0',
    );
    await this.addCheckConstraint(
      queryRunner,
      'listings',
      'listings_status_check',
      "\"status\" IN ('PENDING', 'APPROVED', 'REJECTED', 'SOFT_DELETED')",
    );

    // Create saved_searches table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "saved_searches" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "filter_json" JSONB NOT NULL,
        "created_at" TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Create indexes for saved_searches
    await this.createIndex(
      queryRunner,
      'idx_saved_search_user',
      'saved_searches',
      ['user_id'],
    );
    await this.createIndex(
      queryRunner,
      'idx_saved_search_created_at',
      'saved_searches',
      ['created_at'],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "saved_searches"
    `);

    await this.dropCheckConstraint(
      queryRunner,
      'listings',
      'listings_condition_check',
    );
    await this.dropCheckConstraint(
      queryRunner,
      'listings',
      'listings_annotation_level_check',
    );
    await this.dropCheckConstraint(
      queryRunner,
      'listings',
      'listings_price_check',
    );
    await this.dropCheckConstraint(
      queryRunner,
      'listings',
      'listings_status_check',
    );
  }
}
