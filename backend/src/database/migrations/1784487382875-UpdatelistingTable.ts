import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatelistingTable1784487382875 implements MigrationInterface {
  name = 'UpdatelistingTable1784487382875';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "listings" ADD "description" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "listings" DROP COLUMN "description"`);
  }
}
