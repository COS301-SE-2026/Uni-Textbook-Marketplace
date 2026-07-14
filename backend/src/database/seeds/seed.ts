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

  const university = await universityRepo.save(
    universityRepo.create({
      name: 'University of Pretoria',
      email_domain: 'up.ac.za',
    }),
  );

  const faculty = await facultyRepo.save(
    facultyRepo.create({
      name: 'Engineering, Built Environment and Information Technology',
      university: university,
    }),
  );

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

  const book = await bookRepo.save(
    bookRepo.create({
      isbn: '9781234567890',
      title: 'Database Systems',
      author: 'Korth',
      edition: 7,
      publisher: 'McGraw Hill',
    }),
  );

  const module = await moduleRepo.save(
    moduleRepo.create({
      code: 'COS301',
      name: 'Databases',
      faculty: faculty,
      university: university,
      semester: 2,
    }),
  );

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
