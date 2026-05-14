import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1778577459718 implements MigrationInterface {
  name = 'InitialSchema1778577459718';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const queries = [
      `CREATE TABLE "modules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying(20) NOT NULL, "name" character varying NOT NULL, "faculty" character varying, "semester" integer, "university_id" uuid, CONSTRAINT "UQ_25b42b11ac8b697cdb2eddcef1a" UNIQUE ("code"), CONSTRAINT "PK_7dbefd488bd96c5bf31f0ce0c95" PRIMARY KEY ("id"))`,

      `CREATE TABLE "universities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email_domain" character varying NOT NULL, CONSTRAINT "UQ_a89810551724599560946dc9523" UNIQUE ("email_domain"), CONSTRAINT "PK_8da52f2cee6b407559fdbabf59e" PRIMARY KEY ("id"))`,

      `CREATE TABLE "books" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isbn" character varying(13), "title" character varying NOT NULL, "author" character varying, "edition" integer, "publisher" character varying, CONSTRAINT "UQ_54337dc30d9bb2c3fadebc69094" UNIQUE ("isbn"), CONSTRAINT "PK_f3f2f25a099d24e12545b70b022" PRIMARY KEY ("id"))`,

      `CREATE TYPE "public"."listings_condition_enum" AS ENUM('new', 'good', 'fair', 'poor')`,

      `CREATE TYPE "public"."listings_annotation_level_enum" AS ENUM('none', 'light', 'heavy')`,

      `CREATE TYPE "public"."listings_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'SOFT_DELETED')`,

      `CREATE TABLE "listings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(200), "condition" "public"."listings_condition_enum" NOT NULL, "annotation_level" "public"."listings_annotation_level_enum" NOT NULL, "price" numeric(10,2) NOT NULL, "reviewed_at" TIMESTAMP WITH TIME ZONE, "photo_urls" text array NOT NULL DEFAULT '{}', "status" "public"."listings_status_enum" NOT NULL DEFAULT 'PENDING', "has_notes" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "seller_id" uuid, "book_id" uuid, "module_id" uuid, "reviewed_by" uuid, CONSTRAINT "PK_520ecac6c99ec90bcf5a603cdcb" PRIMARY KEY ("id"))`,

      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "faculty" character varying, "is_verified" boolean NOT NULL DEFAULT false, "role" character varying NOT NULL DEFAULT 'student', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "university_id" uuid, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,

      `CREATE TABLE "otps" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "code" character varying(6) NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "used" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_91fef5ed60605b854a2115d2410" PRIMARY KEY ("id"))`,

      `CREATE TABLE "audit_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "entity_type" character varying NOT NULL, "entity_id" uuid NOT NULL, "action" character varying NOT NULL, "performed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "notes" text, "performed_by" uuid, CONSTRAINT "PK_07fefa57f7f5ab8fc3f52b3ed0b" PRIMARY KEY ("id"))`,

      `ALTER TABLE "modules" ADD CONSTRAINT "FK_90b86c74d4f5e30f1847e5b2120" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,

      `ALTER TABLE "listings" ADD CONSTRAINT "FK_6d2846ee6b337ce5225c8c7286b" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,

      `ALTER TABLE "listings" ADD CONSTRAINT "FK_bfaa743974ea8d0a0e42ce6e9e7" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,

      `ALTER TABLE "listings" ADD CONSTRAINT "FK_8e6a5568c0dca3fe7035c3b86d7" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,

      `ALTER TABLE "listings" ADD CONSTRAINT "FK_71915f307f5d05690bb3cf8201c" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,

      `ALTER TABLE "users" ADD CONSTRAINT "FK_2bef1cc35d499b5c4b5d68fcf7d" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,

      `ALTER TABLE "audit_log" ADD CONSTRAINT "FK_80e2e8cc5eec1cda45594b634c0" FOREIGN KEY ("performed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    ];

    for (const query of queries) {
      await queryRunner.query(query);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const queries = [
      `ALTER TABLE "audit_log" DROP CONSTRAINT "FK_80e2e8cc5eec1cda45594b634c0"`,

      `ALTER TABLE "users" DROP CONSTRAINT "FK_2bef1cc35d499b5c4b5d68fcf7d"`,

      `ALTER TABLE "listings" DROP CONSTRAINT "FK_71915f307f5d05690bb3cf8201c"`,

      `ALTER TABLE "listings" DROP CONSTRAINT "FK_8e6a5568c0dca3fe7035c3b86d7"`,

      `ALTER TABLE "listings" DROP CONSTRAINT "FK_bfaa743974ea8d0a0e42ce6e9e7"`,

      `ALTER TABLE "listings" DROP CONSTRAINT "FK_6d2846ee6b337ce5225c8c7286b"`,

      `ALTER TABLE "modules" DROP CONSTRAINT "FK_90b86c74d4f5e30f1847e5b2120"`,

      `DROP TABLE "audit_log"`,

      `DROP TABLE "otps"`,

      `DROP TABLE "users"`,

      `DROP TABLE "listings"`,

      `DROP TYPE "public"."listings_status_enum"`,

      `DROP TYPE "public"."listings_annotation_level_enum"`,

      `DROP TYPE "public"."listings_condition_enum"`,

      `DROP TABLE "books"`,

      `DROP TABLE "universities"`,

      `DROP TABLE "modules"`,
    ];

    for (const query of queries) {
      await queryRunner.query(query);
    }
  }
}
