import { AppDataSource } from '../../data-source';
import { seedUniversities } from './university.seed';
import { seedFaculties } from './faculty.seed';
import { seedModules } from './module.seed';
import { seedStudents } from './student.seed';
import { seedAdmins } from './admin.seed';
import { seedBooks } from './book.seed';
import { seedModuleBooks } from './module-books.seed';
import { seedListings } from './listing.seed';

async function runSeeds() {
  await AppDataSource.initialize();

  // Refuse to run against a schema that isn't migration-managed.
  if (AppDataSource.options.synchronize) {
    throw new Error(
      'synchronize: true is enabled in the data source. ' +
        'Turn it off and use migrations before running seeds.',
    );
  }

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    console.log('Seeding started...');

    const manager = queryRunner.manager;

    
    await seedUniversities(manager);   
    await seedFaculties(manager);      
    await seedModules(manager);       
    await seedStudents(manager);       // 4. needs universities + faculties
    await seedAdmins(manager);         // 5. needs universities + faculties
    await seedBooks(manager);          // 6. independent
    await seedModuleBooks(manager);    // 7. needs modules + books
    await seedListings(manager);       // 8. needs users + books + modules

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