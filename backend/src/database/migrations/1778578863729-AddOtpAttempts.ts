import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOtpAttempts1778578863729 implements MigrationInterface {
  name = 'AddOtpAttempts1778578863729';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "otps"
      ADD COLUMN "attempts" integer NOT NULL DEFAULT 0
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "otps"
      DROP COLUMN "attempts"
    `);
  }
}
