import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateModulesTable1784025959352 implements MigrationInterface {
  name = 'UpdateModulesTable1784025959352';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "wishlist" DROP CONSTRAINT "FK_wishlist_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist" DROP CONSTRAINT "FK_wishlist_listing"`,
    );
    await queryRunner.query(
      `ALTER TABLE "modules" RENAME COLUMN "faculty" TO "faculty_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "books" DROP CONSTRAINT "UQ_54337dc30d9bb2c3fadebc69094"`,
    );
    await queryRunner.query(`ALTER TABLE "books" DROP COLUMN "isbn"`);
    await queryRunner.query(
      `ALTER TABLE "books" ADD "isbn" character varying(20)`,
    );
    await queryRunner.query(
      `ALTER TABLE "books" ADD CONSTRAINT "UQ_54337dc30d9bb2c3fadebc69094" UNIQUE ("isbn")`,
    );
    await queryRunner.query(`ALTER TABLE "modules" DROP COLUMN "faculty_id"`);
    await queryRunner.query(`ALTER TABLE "modules" ADD "faculty_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "modules" ADD CONSTRAINT "FK_70de6abbb8d2dc5bae2ea096764" FOREIGN KEY ("faculty_id") REFERENCES "faculties"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist" ADD CONSTRAINT "FK_512bf776587ad5fc4f804277d76" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist" ADD CONSTRAINT "FK_cf8a72e62278a6520b4b923e305" FOREIGN KEY ("listings_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "wishlist" DROP CONSTRAINT "FK_cf8a72e62278a6520b4b923e305"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist" DROP CONSTRAINT "FK_512bf776587ad5fc4f804277d76"`,
    );
    await queryRunner.query(
      `ALTER TABLE "modules" DROP CONSTRAINT "FK_70de6abbb8d2dc5bae2ea096764"`,
    );
    await queryRunner.query(`ALTER TABLE "modules" DROP COLUMN "faculty_id"`);
    await queryRunner.query(
      `ALTER TABLE "modules" ADD "faculty_id" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "books" DROP CONSTRAINT "UQ_54337dc30d9bb2c3fadebc69094"`,
    );
    await queryRunner.query(`ALTER TABLE "books" DROP COLUMN "isbn"`);
    await queryRunner.query(
      `ALTER TABLE "books" ADD "isbn" character varying(13)`,
    );
    await queryRunner.query(
      `ALTER TABLE "books" ADD CONSTRAINT "UQ_54337dc30d9bb2c3fadebc69094" UNIQUE ("isbn")`,
    );
    await queryRunner.query(
      `ALTER TABLE "modules" RENAME COLUMN "faculty_id" TO "faculty"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist" ADD CONSTRAINT "FK_wishlist_listing" FOREIGN KEY ("listings_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist" ADD CONSTRAINT "FK_wishlist_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
