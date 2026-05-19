import { AppDataSource } from '../../data-source';

async function reset() {
  await AppDataSource.initialize();

  await AppDataSource.query(`TRUNCATE TABLE listings CASCADE`);
  await AppDataSource.query(`TRUNCATE TABLE books CASCADE`);
  await AppDataSource.query(`TRUNCATE TABLE modules CASCADE`);
  await AppDataSource.query(`TRUNCATE TABLE users CASCADE`);
  await AppDataSource.query(`TRUNCATE TABLE universities CASCADE`);

  console.log('Database reset complete');

  process.exit(0);
}

reset();
