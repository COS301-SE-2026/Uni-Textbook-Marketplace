import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1778577459718 implements MigrationInterface {
  name = 'InitialSchema1778577459718';

  private async exists(
    queryRunner: QueryRunner,
    type: 'table' | 'type' | 'column',
    name: string,
    table?: string,
  ): Promise<boolean> {
    const queries = {
      table: `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1)`,
      type: `SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = $1)`,
      column: `SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = $1 AND column_name = $2)`,
    };

    const params = type === 'column' ? [table!, name] : [name];

    const result = (await queryRunner.query(queries[type], params)) as {
      exists: boolean;
    }[];

    return result?.[0]?.exists === true;
  }

  private async safeQuery(
    queryRunner: QueryRunner,
    query: string,
    ignorePatterns: string[] = [],
  ): Promise<void> {
    try {
      await queryRunner.query(query);
    } catch (err) {
      const error = err as Error;

      const shouldIgnore = ignorePatterns.some((pattern) =>
        error.message?.includes(pattern),
      );

      if (!shouldIgnore) {
        throw error;
      }
    }
  }

  private definition(
    name: string,
    query: string,
  ): { name: string; query: string } {
    return { name, query };
  }

  private foreignKey(
    name: string,
    table: string,
    column: string,
    reference: string,
    onDelete: string,
  ): {
    query: string;
    name: string;
    table: string;
    column: string;
  } {
    return {
      name,
      table,
      column,
      query: `ALTER TABLE "${table}" ADD CONSTRAINT "${name}" FOREIGN KEY ("${column}") REFERENCES ${reference} ON DELETE ${onDelete} ON UPDATE NO ACTION`,
    };
  }

  private getTableDefinitions(): Array<{
    name: string;
    query: string;
  }> {
    return [
      this.definition(
        'modules',
        `CREATE TABLE "modules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying(20) NOT NULL, "name" character varying NOT NULL, "faculty" character varying, "semester" integer, "university_id" uuid, CONSTRAINT "UQ_25b42b11ac8b697cdb2eddcef1a" UNIQUE ("code"), CONSTRAINT "PK_7dbefd488bd96c5bf31f0ce0c95" PRIMARY KEY ("id"))`,
      ),

      this.definition(
        'universities',
        `CREATE TABLE "universities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email_domain" character varying NOT NULL, CONSTRAINT "UQ_a89810551724599560946dc9523" UNIQUE ("email_domain"), CONSTRAINT "PK_8da52f2cee6b407559fdbabf59e" PRIMARY KEY ("id"))`,
      ),

      this.definition(
        'books',
        `CREATE TABLE "books" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isbn" character varying(13), "title" character varying NOT NULL, "author" character varying, "edition" integer, "publisher" character varying, CONSTRAINT "UQ_54337dc30d9bb2c3fadebc69094" UNIQUE ("isbn"), CONSTRAINT "PK_f3f2f25a099d24e12545b70b022" PRIMARY KEY ("id"))`,
      ),

      this.definition(
        'users',
        `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "faculty" character varying, "is_verified" boolean NOT NULL DEFAULT false, "role" character varying NOT NULL DEFAULT 'student', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "university_id" uuid, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
      ),

      this.definition(
        'listings',
        `CREATE TABLE "listings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(200), "condition" "public"."listings_condition_enum" NOT NULL, "annotation_level" "public"."listings_annotation_level_enum" NOT NULL, "price" numeric(10,2) NOT NULL, "reviewed_at" TIMESTAMP WITH TIME ZONE, "photo_urls" text array NOT NULL DEFAULT '{}', "status" "public"."listings_status_enum" NOT NULL DEFAULT 'PENDING', "has_notes" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "seller_id" uuid, "book_id" uuid, "module_id" uuid, "reviewed_by" uuid, CONSTRAINT "PK_520ecac6c99ec90bcf5a603cdcb" PRIMARY KEY ("id"))`,
      ),

      this.definition(
        'otps',
        `CREATE TABLE "otps" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "code" character varying(6) NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "used" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_91fef5ed60605b854a2115d2410" PRIMARY KEY ("id"))`,
      ),

      this.definition(
        'audit_log',
        `CREATE TABLE "audit_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "entity_type" character varying NOT NULL, "entity_id" uuid NOT NULL, "action" character varying NOT NULL, "performed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "notes" text, "performed_by" uuid, CONSTRAINT "PK_07fefa57f7f5ab8fc3f52b3ed0b" PRIMARY KEY ("id"))`,
      ),
    ];
  }

  private getEnumDefinitions(): Array<{
    name: string;
    query: string;
  }> {
    return [
      this.definition(
        'listings_condition_enum',
        `CREATE TYPE "public"."listings_condition_enum" AS ENUM('new', 'good', 'fair', 'poor')`,
      ),

      this.definition(
        'listings_annotation_level_enum',
        `CREATE TYPE "public"."listings_annotation_level_enum" AS ENUM('none', 'light', 'heavy')`,
      ),

      this.definition(
        'listings_status_enum',
        `CREATE TYPE "public"."listings_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'SOFT_DELETED')`,
      ),
    ];
  }

  private getForeignKeyDefinitions(): Array<{
    query: string;
    name: string;
    table: string;
    column: string;
  }> {
    return [
      this.foreignKey(
        'FK_90b86c74d4f5e30f1847e5b2120',
        'modules',
        'university_id',
        '"universities"("id")',
        'CASCADE',
      ),

      this.foreignKey(
        'FK_6d2846ee6b337ce5225c8c7286b',
        'listings',
        'seller_id',
        '"users"("id")',
        'CASCADE',
      ),

      this.foreignKey(
        'FK_bfaa743974ea8d0a0e42ce6e9e7',
        'listings',
        'book_id',
        '"books"("id")',
        'CASCADE',
      ),

      this.foreignKey(
        'FK_8e6a5568c0dca3fe7035c3b86d7',
        'listings',
        'module_id',
        '"modules"("id")',
        'SET NULL',
      ),

      this.foreignKey(
        'FK_71915f307f5d05690bb3cf8201c',
        'listings',
        'reviewed_by',
        '"users"("id")',
        'SET NULL',
      ),

      this.foreignKey(
        'FK_2bef1cc35d499b5c4b5d68fcf7d',
        'users',
        'university_id',
        '"universities"("id")',
        'SET NULL',
      ),

      this.foreignKey(
        'FK_80e2e8cc5eec1cda45594b634c0',
        'audit_log',
        'performed_by',
        '"users"("id")',
        'SET NULL',
      ),
    ];
  }

  private getDropQueries(): string[] {
    const dropForeignKeys = this.getForeignKeyDefinitions().map(
      ({ table, name }) =>
        `ALTER TABLE "${table}" DROP CONSTRAINT IF EXISTS "${name}"`,
    );

    const dropTables = [
      'audit_log',
      'otps',
      'users',
      'listings',
      'books',
      'universities',
      'modules',
    ].map((table) => `DROP TABLE IF EXISTS "${table}"`);

    const dropEnums = [
      'listings_status_enum',
      'listings_annotation_level_enum',
      'listings_condition_enum',
    ].map((type) => `DROP TYPE IF EXISTS "public"."${type}"`);

    return [
      ...dropForeignKeys,
      ...dropTables.slice(0, 4),
      ...dropEnums,
      ...dropTables.slice(4),
    ];
  }

  private async createDefinitions(
    queryRunner: QueryRunner,
    definitions: Array<{ name: string; query: string }>,
    type: 'table' | 'type',
  ): Promise<void> {
    for (const definition of definitions) {
      if (!(await this.exists(queryRunner, type, definition.name))) {
        await queryRunner.query(definition.query);
      }
    }
  }

  private async createEnumTypes(queryRunner: QueryRunner): Promise<void> {
    await this.createDefinitions(
      queryRunner,
      this.getEnumDefinitions(),
      'type',
    );
  }

  private async createTables(queryRunner: QueryRunner): Promise<void> {
    await this.createDefinitions(
      queryRunner,
      this.getTableDefinitions(),
      'table',
    );
  }

  private async addForeignKeys(queryRunner: QueryRunner): Promise<void> {
    for (const fk of this.getForeignKeyDefinitions()) {
      const columnExists = await this.exists(
        queryRunner,
        'column',
        fk.column,
        fk.table,
      );

      if (!columnExists) {
        continue;
      }

      await this.safeQuery(queryRunner, fk.query, [
        `constraint "${fk.name}" already exists`,
        `column "${fk.column}" referenced in foreign key constraint does not exist`,
        'cannot be implemented',
      ]);
    }
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.createEnumTypes(queryRunner);
    await this.createTables(queryRunner);
    await this.addForeignKeys(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const query of this.getDropQueries()) {
      await this.safeQuery(queryRunner, query, ['does not exist']);
    }
  }
}
