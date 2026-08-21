import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCasesTable20260120120000 implements MigrationInterface {
  name = 'CreateCasesTable20260120120000';

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
    const usersExist = await this.tableExists(queryRunner, 'users');

    if (!usersExist) {
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR NOT NULL,
          first_name VARCHAR NOT NULL,
          last_name VARCHAR NOT NULL,
          is_verified BOOLEAN DEFAULT FALSE,
          role VARCHAR(10) DEFAULT 'student',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ,
          deleted_at TIMESTAMPTZ
        )
      `);
    }

    const casesExist = await this.tableExists(queryRunner, 'cases');

    if (!casesExist) {
      await queryRunner.query(`
        CREATE TABLE cases (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          appeal_message TEXT,
          status VARCHAR(20) DEFAULT 'pending'
            CHECK (status IN ('pending', 'upheld', 'reversed')),
          reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
          reviewed_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ,
          deleted_at TIMESTAMPTZ
        )
      `);

      await queryRunner.query(`
        CREATE INDEX idx_cases_user_id ON cases(user_id)
      `);
      await queryRunner.query(`
        CREATE INDEX idx_cases_status ON cases(status)
      `);
      await queryRunner.query(`
        CREATE INDEX idx_cases_user_status ON cases(user_id, status)
      `);
      await queryRunner.query(`
        CREATE INDEX idx_cases_reviewed_by ON cases(reviewed_by)
      `);
      await queryRunner.query(`
        CREATE INDEX idx_cases_created_at ON cases(created_at DESC)
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_cases_created_at`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_cases_reviewed_by`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_cases_user_status`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_cases_status`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_cases_user_id`);

    await queryRunner.query(`DROP TABLE IF EXISTS cases`);
  }
}
