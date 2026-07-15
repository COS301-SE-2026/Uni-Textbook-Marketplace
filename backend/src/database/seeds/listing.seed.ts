import { EntityManager } from 'typeorm';
import { Listing, ListingStatus } from '../entities/listing.entity';
import { User } from '../entities/users.entity';
import { Module } from '../entities/module.entity';
import { Book } from '../entities/book.entity';

export async function seedListings(manager: EntityManager) {
  const listingRepository = manager.getRepository(Listing);
  const userRepository = manager.getRepository(User);
  const moduleRepository = manager.getRepository(Module);
  const bookRepository = manager.getRepository(Book);

  const students = await userRepository.find({
    where: {
      role: 'student',
    },
  });

  const admins = await userRepository.find({
    where: {
      role: 'admin',
    },
  });

  const modules = await moduleRepository.find();
  const books = await bookRepository.find();

  if (
    students.length === 0 ||
    admins.length === 0 ||
    modules.length === 0 ||
    books.length === 0
  ) {
    throw new Error('Missing dependencies for listing seeds');
  }

  const listingsData = [
    {
      title: 'COS212 Algorithms Textbook',
      seller: students[0],
      book: books[0],
      module: modules.find((m) => m.code === 'COS212'),
      condition: 'good' as const,
      annotation_level: 'light' as const,
      price: 450,
      reviewer: admins[0],
      photo_urls: ['./images/cos212.webp'],
      status: ListingStatus.APPROVED,
      has_notes: true,
    },
    {
      title: 'WTW114 Calculus Textbook',
      seller: students[1],
      book: books[6],
      module: modules.find((m) => m.code === 'WTW114'),
      condition: 'fair' as const,
      annotation_level: 'heavy' as const,
      price: 320,
      reviewer: admins[0],
      photo_urls: ['./images/wtw114.webp'],
      status: ListingStatus.APPROVED,
      has_notes: true,
    },
    {
      title: 'COS216 Networking Book',
      seller: students[2],
      book: books[2],
      module: modules.find((m) => m.code === 'COS216'),
      condition: 'new' as const,
      annotation_level: 'none' as const,
      price: 600,
      reviewer: admins[1],
      photo_urls: ['./images/cos216.jpg'],
      status: ListingStatus.APPROVED,
      has_notes: false,
    },
    {
      title: 'COS214 Software Modelling Notes',
      seller: students[3],
      book: books[8],
      module: modules.find((m) => m.code === 'COS214'),
      condition: 'good' as const,
      annotation_level: 'light' as const,
      price: 500,
      reviewer: admins[1],
      photo_urls: ['./images/cos214.webp'],
      status: ListingStatus.PENDING,
      has_notes: true,
    },
    {
      title: 'COS284 Architecture Textbook',
      seller: students[4],
      book: books[5],
      module: modules.find((m) => m.code === 'COS284'),
      condition: 'poor' as const,
      annotation_level: 'heavy' as const,
      price: 180,
      reviewer: admins[0],
      photo_urls: ['./images/cos284.jpg'],
      status: ListingStatus.APPROVED,
      has_notes: true,
    },
    {
      title: 'INF214 Informatics Textbook',
      seller: students[0],
      book: books[3],
      module: modules.find((m) => m.code === 'INF214'),
      condition: 'good' as const,
      annotation_level: 'none' as const,
      price: 410,
      reviewer: admins[1],
      photo_urls: ['./images/inf214.jpg'],
      status: ListingStatus.APPROVED,
      has_notes: false,
    },
    {
      title: 'COS151 Intro to CS Textbook',
      seller: students[1],
      book: books[1],
      module: modules.find((m) => m.code === 'COS151'),
      condition: 'fair' as const,
      annotation_level: 'light' as const,
      price: 250,
      reviewer: admins[0],
      photo_urls: ['./images/cos151.jpg'],
      status: ListingStatus.PENDING,
      has_notes: true,
    },
    {
      title: 'STK110 Statistics Notes',
      seller: students[2],
      book: books[7],
      module: modules.find((m) => m.code === 'STK110'),
      condition: 'good' as const,
      annotation_level: 'heavy' as const,
      price: 300,
      reviewer: admins[1],
      photo_urls: ['./images/stk110.jpg'],
      status: ListingStatus.APPROVED,
      has_notes: true,
    },
    {
      title: 'Clean Code for COS214',
      seller: students[3],
      book: books[8],
      module: modules.find((m) => m.code === 'COS214'),
      condition: 'new' as const,
      annotation_level: 'none' as const,
      price: 550,
      reviewer: admins[0],
      photo_urls: ['./images/cos214.webp'],
      status: ListingStatus.APPROVED,
      has_notes: false,
    },
    {
      title: 'Data Intensive Applications Book',
      seller: students[4],
      book: books[9],
      module: modules.find((m) => m.code === 'COS216'),
      condition: 'good' as const,
      annotation_level: 'light' as const,
      price: 650,
      reviewer: admins[1],
      photo_urls: ['./images/cos216.jpg'],
      status: ListingStatus.PENDING,
      has_notes: true,
    },
  ];

  let createdCount = 0;
  let skippedCount = 0;

  for (const data of listingsData) {
    // Check if a listing with the same title, seller, and book already exists
    const existing = await listingRepository.findOne({
      where: {
        title: data.title,
        seller: { id: data.seller.id },
        book: { id: data.book.id },
      },
    });

    if (existing) {
      console.log(`Skipped (already exists): ${data.title}`);
      skippedCount++;
      continue;
    }

    const listing = listingRepository.create({
      title: data.title,
      seller: data.seller,
      book: data.book,
      module: data.module,
      condition: data.condition,
      annotation_level: data.annotation_level,
      price: data.price,
      reviewer: data.reviewer,
      reviewed_at: new Date(),
      photo_urls: data.photo_urls,
      status: data.status,
      has_notes: data.has_notes,
    });

    await listingRepository.save(listing);
    console.log(`Created: ${data.title}`);
    createdCount++;
  }

  console.log(
    `Listings seeded: ${createdCount} created, ${skippedCount} skipped`,
  );
}
