import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserFacultyRelation1781798442984 implements MigrationInterface {
  name = 'UpdateUserFacultyRelation1781798442984';

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

  private async tableExists(
    queryRunner: QueryRunner,
    table: string,
  ): Promise<boolean> {
    const result = (await queryRunner.query(
      `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      );
    `,
      [table],
    )) as { exists: boolean }[];

    return result && result.length > 0 && result[0]?.exists === true;
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    const facultyExists = await this.columnExists(
      queryRunner,
      'users',
      'faculty',
    );
    const facultyIdExists = await this.columnExists(
      queryRunner,
      'users',
      'faculty_id',
    );

    if (facultyExists && !facultyIdExists) {
      try {
        await queryRunner.query(
          `ALTER TABLE "users" RENAME COLUMN "faculty" TO "faculty_id"`,
        );
      } catch (err) {
        const error = err as Error;

        if (!error.message?.includes('column "faculty" does not exist')) {
          throw error;
        }
      }
    }

    const facultiesExists = await this.tableExists(queryRunner, 'faculties');

    if (!facultiesExists) {
      await queryRunner.query(`
        CREATE TABLE "faculties" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
          "name" character varying(100) NOT NULL, 
          "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), 
          "university_id" uuid NOT NULL, 
          CONSTRAINT "UQ_39747c4153c669f1db683e8f231" UNIQUE ("name"), 
          CONSTRAINT "PK_fd83e4a09c7182ccf7bdb3770b9" PRIMARY KEY ("id")
        )
      `);

      await queryRunner.query(`
        ALTER TABLE "faculties" 
        ADD CONSTRAINT "FK_e7e42880536e292f61869f816cb" 
        FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      `);
    }

    if (!facultyIdExists && !facultyExists) {
      await queryRunner.query(`ALTER TABLE "users" ADD "faculty_id" uuid`);
    }

    await queryRunner.query(`
      DO $$ 
      BEGIN 
        BEGIN
          ALTER TABLE "users" 
          ADD CONSTRAINT "FK_a0842240f363f156f8ee9377fad" 
          FOREIGN KEY ("faculty_id") REFERENCES "faculties"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
        EXCEPTION 
          WHEN duplicate_object THEN 
            RAISE NOTICE 'Constraint FK_a0842240f363f156f8ee9377fad already exists, skipping';
        END;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "FK_a0842240f363f156f8ee9377fad"`,
    );

    await queryRunner.query(
      `ALTER TABLE "faculties" DROP CONSTRAINT IF EXISTS "FK_e7e42880536e292f61869f816cb"`,
    );

    const facultyIdExists = await this.columnExists(
      queryRunner,
      'users',
      'faculty_id',
    );
    if (facultyIdExists) {
      await queryRunner.query(
        `ALTER TABLE "users" DROP COLUMN IF EXISTS "faculty_id"`,
      );
    }

    await queryRunner.query(`DROP TABLE IF EXISTS "faculties"`);

    const facultyColumnExists = await this.columnExists(
      queryRunner,
      'users',
      'faculty',
    );
    const facultyIdColumnExists = await this.columnExists(
      queryRunner,
      'users',
      'faculty_id',
    );

    if (facultyIdColumnExists && !facultyColumnExists) {
      try {
        await queryRunner.query(
          `ALTER TABLE "users" RENAME COLUMN "faculty_id" TO "faculty"`,
        );
      } catch (err) {
        const error = err as Error;
        if (!error.message?.includes('column "faculty_id" does not exist')) {
          throw error;
        }
      }
    }
  }
}
