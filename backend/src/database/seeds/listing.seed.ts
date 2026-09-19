import { EntityManager, In } from 'typeorm';
import {
  Listing,
  ListingStatus,
  ListingsStatus,
} from '../entities/listing.entity';
import { User } from '../entities/users.entity';
import { Module } from '../entities/module.entity';
import { Book } from '../entities/book.entity';

interface ListingSpec {
  sellerEmail: string;
  isbn: string;
  moduleCode: string;
  price: number;
  condition: 'new' | 'good' | 'fair' | 'poor';
  annotation: 'none' | 'light' | 'heavy';
  hasNotes: boolean;
  description: string;
  status?: ListingStatus;
  photo?: string;
}


export async function seedListings(manager: EntityManager) {
  const listingRepo = manager.getRepository(Listing);
  const userRepo = manager.getRepository(User);
  const moduleRepo = manager.getRepository(Module);
  const bookRepo = manager.getRepository(Book);

  
  const sellerEmails = [
    'student1@tuks.co.za',
    'student2@tuks.co.za',
    'student3@tuks.co.za',
    'student4@tuks.co.za',
    'student5@tuks.co.za',
  ];
  const sellers = await userRepo.find({
    where: { email: In(sellerEmails), role: 'student' },
  });
  const sellerByEmail = new Map(sellers.map((s) => [s.email, s]));

  const reviewers = await userRepo.find({ where: { role: 'admin' } });
  if (!reviewers.length) {
    throw new Error('No admin users found — seed admins before listings.');
  }
  const defaultReviewer = reviewers[0];

  const moduleCodes = ['COS212', 'COS216', 'COS214', 'COS284', 'INF214'];
  const modules = await moduleRepo.find({ where: { code: In(moduleCodes) } });
  const moduleByCode = new Map(modules.map((m) => [m.code, m]));

 
  const isbns = [
    '9789814392785', // COS212 - Data Structures and Algorithms in Java (Drozdek)
    '9780132126953', // COS216 - Computer Networks (Tanenbaum)
    '9781259080791', // COS214 - OOSE (Kung)
    '9781292459925', // COS284 - Computer Organization and Architecture (Stallings)
    '9781473768055', // INF214 - Database Principles (Coronel, online)
  ];
  const books = await bookRepo.find({ where: { isbn: In(isbns) } });
  const bookByIsbn = new Map(books.map((b) => [b.isbn, b]));

  if (!sellers.length || !modules.length || !books.length) {
    throw new Error(
      `Missing dependencies for listing seeds — ` +
        `sellers: ${sellers.length}, modules: ${modules.length}, books: ${books.length}`,
    );
  }


  const specs: ListingSpec[] = [
    
    {
      sellerEmail: 'student1@tuks.co.za',
      isbn: '9789814392785',
      moduleCode: 'COS212',
      price: 250,
      condition: 'good',
      annotation: 'light',
      hasNotes: true,
      description: 'Great condition, minimal highlighting in first 3 chapters.',
      status: ListingStatus.APPROVED,
      photo: './images/cos212.webp',
    },
    {
      sellerEmail: 'student2@tuks.co.za',
      isbn: '9789814392785',
      moduleCode: 'COS212',
      price: 280,
      condition: 'new',
      annotation: 'none',
      hasNotes: false,
      description: 'Barely opened, no annotations.',
      status: ListingStatus.APPROVED,
      photo: './images/cos212.webp',
    },
    {
      sellerEmail: 'student3@tuks.co.za',
      isbn: '9789814392785',
      moduleCode: 'COS212',
      price: 250,
      condition: 'fair',
      annotation: 'heavy',
      hasNotes: true,
      description: 'Well used. Plenty of notes — some students find these useful.',
      status: ListingStatus.APPROVED,
      photo: './images/cos212.webp',
    },

    {
      sellerEmail: 'student2@tuks.co.za',
      isbn: '9780132126953',
      moduleCode: 'COS216',
      price: 300,
      condition: 'good',
      annotation: 'none',
      hasNotes: false,
      description: 'Clean copy.',
      status: ListingStatus.APPROVED,
      photo: './images/cos216.jpg',
    },
    {
      sellerEmail: 'student3@tuks.co.za',
      isbn: '9780132126953',
      moduleCode: 'COS216',
      price: 290,
      condition: 'good',
      annotation: 'light',
      hasNotes: true,
      description: 'Slight wear on the cover, otherwise fine.',
      status: ListingStatus.APPROVED,
      photo: './images/cos216.jpg',
    },

    
    {
      sellerEmail: 'student2@tuks.co.za',
      isbn: '9781259080791',
      moduleCode: 'COS214',
      price: 220,
      condition: 'good',
      annotation: 'none',
      hasNotes: false,
      description: 'International edition, same content.',
      status: ListingStatus.APPROVED,
      photo: './images/cos214.webp',
    },
    {
      sellerEmail: 'student3@tuks.co.za',
      isbn: '9781259080791',
      moduleCode: 'COS214',
      price: 250,
      condition: 'new',
      annotation: 'none',
      hasNotes: false,
      description: 'Unused, still in wrapping.',
      status: ListingStatus.APPROVED,
      photo: './images/cos214.webp',
    },

    
    {
      sellerEmail: 'student4@tuks.co.za',
      isbn: '9781292459925',
      moduleCode: 'COS284',
      price: 380,
      condition: 'good',
      annotation: 'light',
      hasNotes: true,
      description: 'Solid condition.',
      status: ListingStatus.APPROVED,
      photo: './images/cos284.jpg',
    },

   
    {
      sellerEmail: 'student5@tuks.co.za',
      isbn: '9781473768055',
      moduleCode: 'INF214',
      price: 410,
      condition: 'good',
      annotation: 'none',
      hasNotes: false,
      description: 'Online-access edition; access code unused.',
      status: ListingStatus.PENDING, // not APPROVED so the optimizer should ignore
      photo: './images/inf214.jpg',
    },
  ];

 
  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const spec of specs) {
    const seller = sellerByEmail.get(spec.sellerEmail);
    const module = moduleByCode.get(spec.moduleCode);
    const book = bookByIsbn.get(spec.isbn);

    if (!seller) {
      console.warn(`Skipped: seller not found (${spec.sellerEmail})`);
      skippedCount++;
      continue;
    }
    if (!module) {
      console.warn(`Skipped: module not found (${spec.moduleCode})`);
      skippedCount++;
      continue;
    }
    if (!book) {
      console.warn(
        `Skipped: book not found (ISBN ${spec.isbn} — is seedModuleBooks up to date?)`,
      );
      skippedCount++;
      continue;
    }

    const existing = await listingRepo.findOne({
      where: {
        seller: { id: seller.id },
        book: { id: book.id },
        module: { id: module.id },
      },
    });

    if (existing) {
      
      existing.title = `${spec.moduleCode} — ${book.title}`;
      existing.price = spec.price;
      existing.condition = spec.condition;
      existing.annotation_level = spec.annotation;
      existing.has_notes = spec.hasNotes;
      existing.description = spec.description;
      existing.status = spec.status ?? ListingStatus.APPROVED;
      existing.photo_urls = spec.photo ? [spec.photo] : [];
      existing.reviewer = defaultReviewer;
      existing.reviewed_at = new Date();
      await listingRepo.save(existing);
      updatedCount++;
      continue;
    }

    const listing = listingRepo.create({
      title: `${spec.moduleCode} — ${book.title}`,
      seller,
      book,
      module,
      condition: spec.condition,
      annotation_level: spec.annotation,
      price: spec.price,
      reviewer: defaultReviewer,
      reviewed_at: new Date(),
      photo_urls: spec.photo ? [spec.photo] : [],
      status: spec.status ?? ListingStatus.APPROVED,
      listing_status: ListingsStatus.AVAILABLE,
      has_notes: spec.hasNotes,
      description: spec.description,
    });

    await listingRepo.save(listing);
    createdCount++;
  }

  console.log(
    `Listings seeded: ${createdCount} created, ${updatedCount} updated, ${skippedCount} skipped`,
  );
}