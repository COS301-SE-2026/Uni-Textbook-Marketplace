import { EntityManager } from 'typeorm';
import { Book } from '../entities/book.entity';

export async function seedBooks(manager: EntityManager) {
  const bookRepository = manager.getRepository(Book);

  const books = [
    bookRepository.create({
      isbn: '9780262033848',
      title: 'Introduction to Algorithms',
      author: 'Thomas H. Cormen',
      edition: 3,
      publisher: 'MIT Press',
    }),

    bookRepository.create({
      isbn: '9780131103627',
      title: 'The C Programming Language',
      author: 'Brian W. Kernighan',
      edition: 2,
      publisher: 'Prentice Hall',
    }),

    bookRepository.create({
      isbn: '9780133594140',
      title: 'Computer Networking: A Top-Down Approach',
      author: 'James F. Kurose',
      edition: 7,
      publisher: 'Pearson',
    }),

    bookRepository.create({
      isbn: '9780078022159',
      title: 'Database System Concepts',
      author: 'Abraham Silberschatz',
      edition: 6,
      publisher: 'McGraw-Hill',
    }),

    bookRepository.create({
      isbn: '9780134685991',
      title: 'Effective Java',
      author: 'Joshua Bloch',
      edition: 3,
      publisher: 'Addison-Wesley',
    }),

    bookRepository.create({
      isbn: '9780321573513',
      title: 'Operating System Concepts',
      author: 'Abraham Silberschatz',
      edition: 9,
      publisher: 'Wiley',
    }),

    bookRepository.create({
      isbn: '9781119456339',
      title: 'Calculus Early Transcendentals',
      author: 'James Stewart',
      edition: 8,
      publisher: 'Cengage Learning',
    }),

    bookRepository.create({
      isbn: '9780199535569',
      title: 'Introduction to Probability',
      author: 'Dimitri Bertsekas',
      edition: 2,
      publisher: 'Athena Scientific',
    }),

    bookRepository.create({
      isbn: '9780132350884',
      title: 'Clean Code',
      author: 'Robert C. Martin',
      edition: 1,
      publisher: 'Prentice Hall',
    }),

    bookRepository.create({
      isbn: '9781492056355',
      title: 'Designing Data-Intensive Applications',
      author: 'Martin Kleppmann',
      edition: 1,
      publisher: "O'Reilly Media",
    }),
  ];

  await bookRepository.save(books);

  console.log('10 books seeded');
}
