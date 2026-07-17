import { AppDataSource } from '../../data-source';
import { seedUniversities } from './university.seed';
import { seedFaculties } from './faculty.seed';
import { seedModules } from './module.seed';
import { seedStudents } from './student.seed';
import { seedAdmins } from './admin.seed';
import { seedBooks } from './book.seed';
import { seedListings } from './listing.seed';

async function runSeeds() {
  await AppDataSource.initialize();

  await AppDataSource.synchronize(false); // false means don't drop data

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    console.log('Seeding started...');

    const manager = queryRunner.manager;

    await seedUniversities(manager);
    await seedFaculties(manager);
    await seedModules(manager);
    await seedStudents(manager);
    await seedAdmins(manager);
    await seedBooks(manager);
    await seedListings(manager);

    await queryRunner.commitTransaction();

    console.log('All seeds completed successfully');

    process.exit(0);
  } catch (error) {
    await queryRunner.rollbackTransaction();

    console.error('Seed failed, rolled back:', error);

    process.exit(1);
  } finally {
    await queryRunner.release();
  }
}

void runSeeds();
