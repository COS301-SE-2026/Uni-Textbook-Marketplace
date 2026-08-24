import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatelistingTable1784487382875 implements MigrationInterface {
  name = 'UpdatelistingTable1784487382875';

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
    const columnExists = await this.columnExists(
      queryRunner,
      'listings',
      'description',
    );

    if (!columnExists) {
      await queryRunner.query(`ALTER TABLE "listings" ADD "description" text`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listings" DROP COLUMN IF EXISTS "description"`,
    );
  }
}
