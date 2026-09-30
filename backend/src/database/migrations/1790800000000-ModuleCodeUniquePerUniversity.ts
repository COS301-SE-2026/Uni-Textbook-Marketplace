import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModuleCodeUniquePerUniversity1790800000000
  implements MigrationInterface
{
  name = 'ModuleCodeUniquePerUniversity1790800000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "modules" DROP CONSTRAINT IF EXISTS "UQ_25b42b11ac8b697cdb2eddcef1a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "modules" ADD CONSTRAINT "UQ_modules_code_university" UNIQUE ("code", "university_id")`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "modules" DROP CONSTRAINT IF EXISTS "UQ_modules_code_university"`,
    );
    await queryRunner.query(
      `ALTER TABLE "modules" ADD CONSTRAINT "UQ_25b42b11ac8b697cdb2eddcef1a" UNIQUE ("code")`,
    );
  }
}