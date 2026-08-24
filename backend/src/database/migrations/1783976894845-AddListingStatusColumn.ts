import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddListingStatusColumn1783976894845 implements MigrationInterface {
  name = 'AddListingStatusColumn1783976894845';

  private async enumExists(
    queryRunner: QueryRunner,
    enumName: string,
  ): Promise<boolean> {
    const result = (await queryRunner.query(
      `
      SELECT EXISTS (
        SELECT FROM pg_type 
        WHERE typname = $1
      );
    `,
      [enumName],
    )) as { exists: boolean }[];

    return result && result.length > 0 && result[0]?.exists === true;
  }

  private async columnExists(
    queryRunner: QueryRunner,
    table: string,
    column: string,
  ): Promise<boolean> {
    const result = (await queryRunner.query(
      `
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = $1 
        AND column_name = $2
      );
    `,
      [table, column],
    )) as { exists: boolean }[];

    return result && result.length > 0 && result[0]?.exists === true;
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    const enumExists = await this.enumExists(
      queryRunner,
      'listings_listing_status_enum',
    );

    if (!enumExists) {
      await queryRunner.query(`
        CREATE TYPE "public"."listings_listing_status_enum" AS ENUM('AVAILABLE','RESERVED','SOLD','WITHDRAWN')
      `);
    }

    const columnExists = await this.columnExists(
      queryRunner,
      'listings',
      'listing_status',
    );

    if (!columnExists) {
      await queryRunner.query(`
        ALTER TABLE "listings" 
        ADD COLUMN "listing_status" "public"."listings_listing_status_enum" NOT NULL DEFAULT 'AVAILABLE'
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listings" DROP COLUMN IF EXISTS "listing_status"`,
    );

    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."listings_listing_status_enum"`,
    );
  }
}
