import { AppDataSource } from '../../data-source';
import { User } from '../entities/users.entity';
import { Book } from '../entities/book.entity';
import { Module } from '../entities/module.entity';
import { Listing, ListingStatus } from '../entities/listing.entity';
import { Faculty } from '../entities/faculty.entity';
import { University } from '../entities/university.entity';

async function seed() {
  await AppDataSource.initialize();

  console.log('Seeding db');

  const userRepo = AppDataSource.getRepository(User);
  const bookRepo = AppDataSource.getRepository(Book);
  const moduleRepo = AppDataSource.getRepository(Module);
  const listingRepo = AppDataSource.getRepository(Listing);
  const facultyRepo = AppDataSource.getRepository(Faculty);
  const universityRepo = AppDataSource.getRepository(University);

  let university = await universityRepo.findOne({
    where: { email_domain: 'up.ac.za' },
  });

  if (!university) {
    university = universityRepo.create({
      name: 'University of Pretoria',
      email_domain: 'up.ac.za',
    });
    await universityRepo.save(university);
  }

  // get or create the Faculty
  let faculty = await facultyRepo.findOne({
    where: { name: 'Engineering' },
  });

  if (!faculty) {
    faculty = facultyRepo.create({
      name: 'Engineering',
    });
    await facultyRepo.save(faculty);
    console.log('Faculty created');
  }

  const user = await userRepo.save(
    userRepo.create({
      email: 'student@up.ac.za',
      password_hash: 'hashed-password',
      first_name: 'Test',
      last_name: 'User',
      role: 'student',
      is_verified: true,
      university: university,
    }),
  );

  // create books
  const book = await bookRepo.save(
    bookRepo.create({
      isbn: '9781234567890',
      title: 'Database Systems',
      author: 'Korth',
      edition: 7,
      publisher: 'McGraw Hill',
    }),
  );

  // add modules - now using Faculty entity
  const module = await moduleRepo.save(
    moduleRepo.create({
      code: 'COS301',
      name: 'Databases',
      faculty: faculty,
      semester: 2,
    }),
  );

  // create listings
  await listingRepo.save([
    listingRepo.create({
      title: 'COS301 DB Textbook - Excellent Condition',
      seller: user,
      book: book,
      module: module,
      condition: 'good',
      annotation_level: 'light',
      price: 250,
      status: ListingStatus.APPROVED,
      photo_urls: [],
      has_notes: false,
    }),
    listingRepo.create({
      title: 'Old DB textbook (urgent sale)',
      seller: user,
      book: book,
      module: module,
      condition: 'fair',
      annotation_level: 'none',
      price: 120,
      status: ListingStatus.PENDING,
      photo_urls: [],
      has_notes: true,
    }),
  ]);

  console.log('Seeding complete');

  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
