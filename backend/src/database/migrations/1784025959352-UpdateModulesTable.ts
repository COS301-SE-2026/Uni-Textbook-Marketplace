import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateModulesTable1784025959352 implements MigrationInterface {
  name = 'UpdateModulesTable1784025959352';

  private async columnExists(
    queryRunner: QueryRunner,
    table: string,
    column: string,
  ): Promise<boolean> {
    const result = (await queryRunner.query(
      `SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = $1 AND column_name = $2)`,
      [table, column],
    )) as { exists: boolean }[];
    return result?.[0]?.exists === true;
  }

  private async constraintExists(
    queryRunner: QueryRunner,
    constraintName: string,
  ): Promise<boolean> {
    const result = (await queryRunner.query(
      `SELECT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = $1)`,
      [constraintName],
    )) as { exists: boolean }[];
    return result?.[0]?.exists === true;
  }

  private async getColumnType(
    queryRunner: QueryRunner,
    table: string,
    column: string,
  ): Promise<string | null> {
    const result = (await queryRunner.query(
      `SELECT data_type, udt_name FROM information_schema.columns WHERE table_name = $1 AND column_name = $2`,
      [table, column],
    )) as { data_type: string; udt_name: string }[];
    return result?.[0]?.udt_name || result?.[0]?.data_type || null;
  }

  private async renameFacultyColumn(queryRunner: QueryRunner): Promise<void> {
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

    if (facultyIdExists) {
      const columnType = await this.getColumnType(
        queryRunner,
        'modules',
        'faculty_id',
      );

      if (
        columnType?.includes('varchar') ||
        columnType === 'character varying' ||
        columnType === 'text'
      ) {
        const constraintExists = await this.constraintExists(
          queryRunner,
          'FK_70de6abbb8d2dc5bae2ea096764',
        );
        if (constraintExists) {
          await queryRunner.query(
            `ALTER TABLE "modules" DROP CONSTRAINT IF EXISTS "FK_70de6abbb8d2dc5bae2ea096764"`,
          );
        }

        await queryRunner.query(`
          ALTER TABLE "modules" 
          ALTER COLUMN "faculty_id" TYPE uuid 
          USING faculty_id::uuid
        `);
      }
    }

    if (!facultyIdExists && !facultyColumnExists) {
      await queryRunner.query(`ALTER TABLE "modules" ADD "faculty_id" uuid`);
    }
  }

  private async updateBooksIsbnColumn(queryRunner: QueryRunner): Promise<void> {
    const isbnColumnExists = await this.columnExists(
      queryRunner,
      'books',
      'isbn',
    );
    if (!isbnColumnExists) {
      return;
    }

    const isbnType = (await queryRunner.query(
      `SELECT data_type, character_maximum_length FROM information_schema.columns WHERE table_name = 'books' AND column_name = 'isbn'`,
    )) as { data_type: string; character_maximum_length: number }[];

    const needsUpdate =
      isbnType.length > 0 &&
      (isbnType[0].data_type !== 'character varying' ||
        isbnType[0].character_maximum_length !== 20);

    if (!needsUpdate) {
      return;
    }

    const isbnConstraintExists = await this.constraintExists(
      queryRunner,
      'UQ_54337dc30d9bb2c3fadebc69094',
    );

    if (isbnConstraintExists) {
      await queryRunner.query(
        `ALTER TABLE "books" DROP CONSTRAINT IF EXISTS "UQ_54337dc30d9bb2c3fadebc69094"`,
      );
    }

    await queryRunner.query(`ALTER TABLE "books" DROP COLUMN IF EXISTS "isbn"`);
    await queryRunner.query(
      `ALTER TABLE "books" ADD "isbn" character varying(20)`,
    );
    await queryRunner.query(
      `ALTER TABLE "books" ADD CONSTRAINT "UQ_54337dc30d9bb2c3fadebc69094" UNIQUE ("isbn")`,
    );
  }

  private async addFacultyForeignKey(queryRunner: QueryRunner): Promise<void> {
    const facultiesExist = (await queryRunner.query(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'faculties')`,
    )) as { exists: boolean }[];

    if (!facultiesExist?.[0]?.exists) {
      console.warn('Skipping foreign key: faculties table does not exist');
      return;
    }

    const facultyIdExists = await this.columnExists(
      queryRunner,
      'modules',
      'faculty_id',
    );
    if (!facultyIdExists) {
      console.warn(
        'Skipping foreign key: faculty_id column does not exist in modules',
      );
      return;
    }

    const columnType = await this.getColumnType(
      queryRunner,
      'modules',
      'faculty_id',
    );
    if (columnType !== 'uuid') {
      console.warn(
        `Skipping foreign key: faculty_id is type "${columnType}", expected "uuid"`,
      );
      return;
    }

    const fkConstraintExists = await this.constraintExists(
      queryRunner,
      'FK_70de6abbb8d2dc5bae2ea096764',
    );

    if (fkConstraintExists) {
      return;
    }

    try {
      await queryRunner.query(`
        ALTER TABLE "modules" 
        ADD CONSTRAINT "FK_70de6abbb8d2dc5bae2ea096764" 
        FOREIGN KEY ("faculty_id") REFERENCES "faculties"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      `);
    } catch (err) {
      const error = err as Error;
      const shouldIgnore = [
        'constraint "FK_70de6abbb8d2dc5bae2ea096764" already exists',
        'foreign key constraint "FK_70de6abbb8d2dc5bae2ea096764" cannot be implemented',
      ];
      if (!shouldIgnore.some((pattern) => error.message?.includes(pattern))) {
        throw error;
      }
      console.warn(
        `Foreign key "FK_70de6abbb8d2dc5bae2ea096764" skipped: ${error.message}`,
      );
    }
  }

  private async recreateWishlistConstraints(
    queryRunner: QueryRunner,
  ): Promise<void> {
    const constraints = [
      {
        name: 'FK_512bf776587ad5fc4f804277d76',
        query: `
          DO $$ BEGIN
            ALTER TABLE "wishlist" ADD CONSTRAINT "FK_512bf776587ad5fc4f804277d76" 
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
            EXCEPTION WHEN duplicate_object THEN NULL;
          END $$;
        `,
      },
      {
        name: 'FK_cf8a72e62278a6520b4b923e305',
        query: `
          DO $$ BEGIN
            ALTER TABLE "wishlist" ADD CONSTRAINT "FK_cf8a72e62278a6520b4b923e305" 
            FOREIGN KEY ("listings_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
            EXCEPTION WHEN duplicate_object THEN NULL;
          END $$;
        `,
      },
    ];

    for (const constraint of constraints) {
      const exists = await this.constraintExists(queryRunner, constraint.name);
      if (!exists) {
        try {
          await queryRunner.query(constraint.query);
        } catch (err) {
          const error = err as Error;
          if (
            !error.message?.includes('does not exist') &&
            !error.message?.includes('relation')
          ) {
            console.warn(
              `Warning creating constraint ${constraint.name}: ${error.message}`,
            );
          }
        }
      }
    }
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.renameFacultyColumn(queryRunner);
    await this.updateBooksIsbnColumn(queryRunner);
    await this.addFacultyForeignKey(queryRunner);
    await this.recreateWishlistConstraints(queryRunner);
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

    const facultyIdExists = await this.columnExists(
      queryRunner,
      'modules',
      'faculty_id',
    );
    if (facultyIdExists) {
      await queryRunner.query(
        `ALTER TABLE "modules" DROP COLUMN IF EXISTS "faculty_id"`,
      );
    }

    const facultyExists = await this.columnExists(
      queryRunner,
      'modules',
      'faculty',
    );
    if (!facultyExists) {
      await queryRunner.query(
        `ALTER TABLE "modules" ADD "faculty" character varying`,
      );
    }

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
