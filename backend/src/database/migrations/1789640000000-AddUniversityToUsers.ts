import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniversityToUsers1789640000000 implements MigrationInterface {
  name = 'AddUniversityToUsers1789640000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
   
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "university_id" uuid`,
    );

   
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conrelid = 'users'::regclass
            AND contype = 'f'
            AND pg_get_constraintdef(oid) LIKE '%university_id%'
        ) THEN
          ALTER TABLE "users"
            ADD CONSTRAINT "FK_users_university"
            FOREIGN KEY ("university_id")
            REFERENCES "universities"("id")
            ON DELETE SET NULL
            ON UPDATE NO ACTION;
        END IF;
      END
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    
    await queryRunner.query(`
      ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "FK_users_university"
    `);
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN IF EXISTS "university_id"`,
    );
  }
}