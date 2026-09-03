import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOtpAttempts1778578863729 implements MigrationInterface {
  name = 'AddOtpAttempts1778578863729';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const result = (await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'otps' 
        AND column_name = 'attempts'
      );
    `)) as { exists: boolean }[];

    const columnExists =
      result &&
      Array.isArray(result) &&
      result.length > 0 &&
      result[0]?.exists === true;

    if (!columnExists) {
      await queryRunner.query(`
        ALTER TABLE "otps"
        ADD COLUMN "attempts" integer NOT NULL DEFAULT 0
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "otps"
      DROP COLUMN IF EXISTS "attempts"
    `);
  }
}
