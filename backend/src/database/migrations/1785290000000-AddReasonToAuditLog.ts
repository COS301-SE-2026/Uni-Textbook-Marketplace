import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReasonToAuditLog1785290000000 implements MigrationInterface {
  name = 'AddReasonToAuditLog1785290000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "audit_log" ADD COLUMN IF NOT EXISTS "reason" TEXT
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "audit_log" DROP COLUMN IF EXISTS "reason"
        `);
  }
}
