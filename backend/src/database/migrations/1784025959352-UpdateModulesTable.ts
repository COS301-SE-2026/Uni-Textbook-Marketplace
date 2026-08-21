import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateModulesTable1784025959352 implements MigrationInterface {
  name = 'UpdateModulesTable1784025959352';

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

  private async constraintExists(
    queryRunner: QueryRunner,
    constraintName: string,
  ): Promise<boolean> {
    const result = (await queryRunner.query(
      `
      SELECT EXISTS (
        SELECT FROM information_schema.table_constraints 
        WHERE constraint_name = $1
      );
    `,
      [constraintName],
    )) as { exists: boolean }[];

    return result && result.length > 0 && result[0]?.exists === true;
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    const facultyColumnExists = await this.columnExists(
      queryRunner,
      'modules',
      'faculty',
    );
    const facultyIdExists = await this.columnExists(
      queryRunner,
      'modules',
      'faculty_id',
    );

    if (facultyColumnExists && !facultyIdExists) {
      try {
        await queryRunner.query(
          `ALTER TABLE "modules" RENAME COLUMN "faculty" TO "faculty_id"`,
        );
      } catch (err) {
        const error = err as Error;
        if (!error.message?.includes('column "faculty" does not exist')) {
          throw error;
        }
      }
    }

    const isbnColumnExists = await this.columnExists(
      queryRunner,
      'books',
      'isbn',
    );
    const isbnConstraintExists = await this.constraintExists(
      queryRunner,
      'UQ_54337dc30d9bb2c3fadebc69094',
    );

    if (isbnColumnExists) {
      const isbnType = (await queryRunner.query(`
        SELECT data_type, character_maximum_length 
        FROM information_schema.columns 
        WHERE table_name = 'books' 
        AND column_name = 'isbn'
      `)) as { data_type: string; character_maximum_length: number }[];

      if (
        isbnType.length > 0 &&
        (isbnType[0].data_type !== 'character varying' ||
          isbnType[0].character_maximum_length !== 20)
      ) {
        // Drop constraint if it exists
        if (isbnConstraintExists) {
          await queryRunner.query(
            `ALTER TABLE "books" DROP CONSTRAINT IF EXISTS "UQ_54337dc30d9bb2c3fadebc69094"`,
          );
        }

        await queryRunner.query(
          `ALTER TABLE "books" DROP COLUMN IF EXISTS "isbn"`,
        );
        await queryRunner.query(
          `ALTER TABLE "books" ADD "isbn" character varying(20)`,
        );
        await queryRunner.query(
          `ALTER TABLE "books" ADD CONSTRAINT "UQ_54337dc30d9bb2c3fadebc69094" UNIQUE ("isbn")`,
        );
      }
    }

    if (!facultyIdExists && !facultyColumnExists) {
      await queryRunner.query(`ALTER TABLE "modules" ADD "faculty_id" uuid`);
    }

    const fkConstraintExists = await this.constraintExists(
      queryRunner,
      'FK_70de6abbb8d2dc5bae2ea096764',
    );

    if (!fkConstraintExists) {
      try {
        await queryRunner.query(`
          ALTER TABLE "modules" 
          ADD CONSTRAINT "FK_70de6abbb8d2dc5bae2ea096764" 
          FOREIGN KEY ("faculty_id") REFERENCES "faculties"("id") ON DELETE SET NULL ON UPDATE NO ACTION
        `);
      } catch (err) {
        const error = err as Error;
        if (
          !error.message?.includes(
            'constraint "FK_70de6abbb8d2dc5bae2ea096764" already exists',
          )
        ) {
          throw error;
        }
      }
    }

    const wishlistUserFkExists = await this.constraintExists(
      queryRunner,
      'FK_512bf776587ad5fc4f804277d76',
    );
    const wishlistListingFkExists = await this.constraintExists(
      queryRunner,
      'FK_cf8a72e62278a6520b4b923e305',
    );

    if (!wishlistUserFkExists) {
      await queryRunner.query(`
        DO $$ BEGIN
          ALTER TABLE "wishlist" ADD CONSTRAINT "FK_512bf776587ad5fc4f804277d76" 
          FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
          EXCEPTION WHEN duplicate_object THEN NULL;
        END $$;
      `);
    }

    if (!wishlistListingFkExists) {
      await queryRunner.query(`
        DO $$ BEGIN
          ALTER TABLE "wishlist" ADD CONSTRAINT "FK_cf8a72e62278a6520b4b923e305" 
          FOREIGN KEY ("listings_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
          EXCEPTION WHEN duplicate_object THEN NULL;
        END $$;
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "wishlist" DROP CONSTRAINT IF EXISTS "FK_cf8a72e62278a6520b4b923e305"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist" DROP CONSTRAINT IF EXISTS "FK_512bf776587ad5fc4f804277d76"`,
    );

    await queryRunner.query(
      `ALTER TABLE "modules" DROP CONSTRAINT IF EXISTS "FK_70de6abbb8d2dc5bae2ea096764"`,
    );

    await queryRunner.query(
      `ALTER TABLE "modules" DROP COLUMN IF EXISTS "faculty_id"`,
    );

    await queryRunner.query(
      `ALTER TABLE "modules" ADD "faculty" character varying`,
    );

    await queryRunner.query(
      `ALTER TABLE "books" DROP CONSTRAINT IF EXISTS "UQ_54337dc30d9bb2c3fadebc69094"`,
    );
    await queryRunner.query(`ALTER TABLE "books" DROP COLUMN IF EXISTS "isbn"`);
    await queryRunner.query(
      `ALTER TABLE "books" ADD "isbn" character varying(13)`,
    );
    await queryRunner.query(
      `ALTER TABLE "books" ADD CONSTRAINT "UQ_54337dc30d9bb2c3fadebc69094" UNIQUE ("isbn")`,
    );
  }
}
