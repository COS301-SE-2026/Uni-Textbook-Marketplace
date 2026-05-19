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

  const listings = [
    listingRepository.create({
      title: 'COS212 Algorithms Textbook',

      seller: students[0],

      book: books[0],

      module: modules.find((m) => m.code === 'COS212'),

      condition: 'good',

      annotation_level: 'light',

      price: 450,

      reviewer: admins[0],

      reviewed_at: new Date(),

      photo_urls: ['./images/cos212.webp'],

      status: ListingStatus.APPROVED,

      has_notes: true,
    }),

    listingRepository.create({
      title: 'WTW114 Calculus Textbook',

      seller: students[1],

      book: books[6],

      module: modules.find((m) => m.code === 'WTW114'),

      condition: 'fair',

      annotation_level: 'heavy',

      price: 320,

      reviewer: admins[0],

      reviewed_at: new Date(),

      photo_urls: ['./images/wtw114.webp'],

      status: ListingStatus.APPROVED,

      has_notes: true,
    }),

    listingRepository.create({
      title: 'COS216 Networking Book',

      seller: students[2],

      book: books[2],

      module: modules.find((m) => m.code === 'COS216'),

      condition: 'new',

      annotation_level: 'none',

      price: 600,

      reviewer: admins[1],

      reviewed_at: new Date(),

      photo_urls: ['./images/cos216.jpg'],

      status: ListingStatus.APPROVED,

      has_notes: false,
    }),

    listingRepository.create({
      title: 'COS214 Software Modelling Notes',

      seller: students[3],

      book: books[8],

      module: modules.find((m) => m.code === 'COS214'),

      condition: 'good',

      annotation_level: 'light',

      price: 500,

      reviewer: admins[1],

      reviewed_at: new Date(),

      photo_urls: ['./images/cos214.webp'],

      status: ListingStatus.PENDING,

      has_notes: true,
    }),

    listingRepository.create({
      title: 'COS284 Architecture Textbook',

      seller: students[4],

      book: books[5],

      module: modules.find((m) => m.code === 'COS284'),

      condition: 'poor',

      annotation_level: 'heavy',

      price: 180,

      reviewer: admins[0],

      reviewed_at: new Date(),

      photo_urls: ['./images/cos284.jpg'],

      status: ListingStatus.APPROVED,

      has_notes: true,
    }),

    listingRepository.create({
      title: 'INF214 Informatics Textbook',

      seller: students[0],

      book: books[3],

      module: modules.find((m) => m.code === 'INF214'),

      condition: 'good',

      annotation_level: 'none',

      price: 410,

      reviewer: admins[1],

      reviewed_at: new Date(),

      photo_urls: ['./images/inf214.jpg'],

      status: ListingStatus.APPROVED,

      has_notes: false,
    }),

    listingRepository.create({
      title: 'COS151 Intro to CS Textbook',

      seller: students[1],

      book: books[1],

      module: modules.find((m) => m.code === 'COS151'),

      condition: 'fair',

      annotation_level: 'light',

      price: 250,

      reviewer: admins[0],

      reviewed_at: new Date(),

      photo_urls: ['./images/cos151.jpg'],

      status: ListingStatus.PENDING,

      has_notes: true,
    }),

    listingRepository.create({
      title: 'STK110 Statistics Notes',

      seller: students[2],

      book: books[7],

      module: modules.find((m) => m.code === 'STK110'),

      condition: 'good',

      annotation_level: 'heavy',

      price: 300,

      reviewer: admins[1],

      reviewed_at: new Date(),

      photo_urls: ['./images/stk110.jpg'],

      status: ListingStatus.APPROVED,

      has_notes: true,
    }),

    listingRepository.create({
      title: 'Clean Code for COS214',

      seller: students[3],

      book: books[8],

      module: modules.find((m) => m.code === 'COS214'),

      condition: 'new',

      annotation_level: 'none',

      price: 550,

      reviewer: admins[0],

      reviewed_at: new Date(),

      photo_urls: ['./images/cos214.webp'],

      status: ListingStatus.APPROVED,

      has_notes: false,
    }),

    listingRepository.create({
      title: 'Data Intensive Applications Book',

      seller: students[4],

      book: books[9],

      module: modules.find((m) => m.code === 'COS216'),

      condition: 'good',

      annotation_level: 'light',

      price: 650,

      reviewer: admins[1],

      reviewed_at: new Date(),

      photo_urls: ['./images/cos216.jpg'],

      status: ListingStatus.PENDING,

      has_notes: true,
    }),
  ];

  await listingRepository.save(listings);

  console.log('10 listings seeded');
}
