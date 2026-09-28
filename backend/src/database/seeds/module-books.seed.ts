import { EntityManager, In, Repository } from 'typeorm';
import { Logger } from '@nestjs/common';

import { ModuleBook } from '../entities/module-book.entity';
import { Module } from '../entities/module.entity';
import { Book } from '../entities/book.entity';

import rawModules from '../../../modules-my.json';

interface RawTextbook {
  title: string;
  authors: string | null;
  edition: string | number | null;
  isbn13: string | null;
}

interface RawModule {
  module: string;
  textbooks: RawTextbook[];
}

interface SeedRow {
  moduleCode: string;
  isbn: string;
  title: string;
  author?: string;
  edition?: number;
}

export interface SeedModuleBooksResult {
  booksCreated: number;
  booksUpdated: number;
  linksCreated: number;
  linksSkipped: number;
  missingModules: string[];
}

const ISBN_PATTERN = /^\d{10,13}$/;
const EDITION_PATTERN = /\d+/;
const ISBN_SUFFIX_PATTERN = /\s*\([^)]*\)$/;

function normaliseCode(code: string): string {
  return code.replace(/\s+/g, '').toUpperCase();
}

function parseEdition(
  value: string | number | null | undefined,
): number | undefined {
  if (value == null) return undefined;

  if (typeof value === 'number') return value;

  const match = EDITION_PATTERN.exec(value);

  return match ? Number.parseInt(match[0], 10) : undefined;
}

function cleanIsbn(value: string): string {
  return value.trim().replace(ISBN_SUFFIX_PATTERN, '').replace(/EP$/i, '');
}

function extractIsbns(isbn13: string): string[] {
  return isbn13
    .split('/')
    .map(cleanIsbn)
    .filter((isbn) => ISBN_PATTERN.test(isbn));
}

function buildSeedRows(): SeedRow[] {
  const raw = rawModules as { modules: RawModule[] };
  const rows: SeedRow[] = [];

  for (const entry of raw.modules) {
    const moduleCode = normaliseCode(entry.module);

    for (const textbook of entry.textbooks) {
      if (!textbook.isbn13) continue;

      const isbns = extractIsbns(textbook.isbn13);

      for (const isbn of isbns) {
        rows.push({
          moduleCode,
          isbn,
          title: textbook.title,
          author: textbook.authors ?? undefined,
          edition: parseEdition(textbook.edition),
        });
      }
    }
  }

  return rows;
}

function createEmptyResult(): SeedModuleBooksResult {
  return {
    booksCreated: 0,
    booksUpdated: 0,
    linksCreated: 0,
    linksSkipped: 0,
    missingModules: [],
  };
}

function createModuleMap(modules: Module[]): Map<string, Module> {
  return new Map(modules.map((module) => [normaliseCode(module.code), module]));
}

function findMissingModules(
  moduleCodes: string[],
  moduleByNormalisedCode: Map<string, Module>,
): string[] {
  return moduleCodes.filter((code) => !moduleByNormalisedCode.has(code));
}

function logMissingModules(logger: Logger, missingModules: string[]): void {
  if (!missingModules.length) return;

  const displayedModules = missingModules.slice(0, 10).join(', ');

  const suffix = missingModules.length > 10 ? ' …' : '';

  logger.warn(
    `${missingModules.length} module codes in seed data have no matching Module row: ` +
      displayedModules +
      suffix,
  );
}

function needsBookUpdate(existing: Book, row: SeedRow): boolean {
  return (
    existing.title !== row.title ||
    (row.author !== undefined && existing.author !== row.author) ||
    (row.edition !== undefined && existing.edition !== row.edition)
  );
}

async function createBook(
  bookRepo: Repository<Book>,
  row: SeedRow,
): Promise<Book> {
  const created = bookRepo.create({
    isbn: row.isbn,
    title: row.title,
    author: row.author,
    edition: row.edition,
  });

  return bookRepo.save(created);
}

async function updateBook(
  bookRepo: Repository<Book>,
  existing: Book,
  row: SeedRow,
): Promise<Book> {
  existing.title = row.title;

  if (row.author !== undefined) {
    existing.author = row.author;
  }

  if (row.edition !== undefined) {
    existing.edition = row.edition;
  }

  return bookRepo.save(existing);
}

async function processBooks(
  bookRepo: Repository<Book>,
  rows: SeedRow[],
  existingBooks: Book[],
): Promise<{
  bookByIsbn: Map<string, Book>;
  booksCreated: number;
  booksUpdated: number;
}> {
  const bookByIsbn = new Map(existingBooks.map((book) => [book.isbn, book]));

  let booksCreated = 0;
  let booksUpdated = 0;

  for (const row of rows) {
    const existing = bookByIsbn.get(row.isbn);

    if (!existing) {
      const saved = await createBook(bookRepo, row);

      bookByIsbn.set(row.isbn, saved);
      booksCreated++;
      continue;
    }

    if (!needsBookUpdate(existing, row)) continue;

    const saved = await updateBook(bookRepo, existing, row);

    bookByIsbn.set(row.isbn, saved);
    booksUpdated++;
  }

  return {
    bookByIsbn,
    booksCreated,
    booksUpdated,
  };
}

function createLinkKey(moduleId: string, bookId: string): string {
  return `${moduleId}::${bookId}`;
}

async function createModuleBookLinks(
  moduleBookRepo: Repository<ModuleBook>,
  rows: SeedRow[],
  moduleByNormalisedCode: Map<string, Module>,
  bookByIsbn: Map<string, Book>,
): Promise<{
  linksCreated: number;
  linksSkipped: number;
}> {
  const validModuleIds = [...moduleByNormalisedCode.values()].map(
    (module) => module.id,
  );

  const validBookIds = [...bookByIsbn.values()].map((book) => book.id);

  const existingLinks = await moduleBookRepo.find({
    where: {
      module: {
        id: In(validModuleIds),
      },
      book: {
        id: In(validBookIds),
      },
    },
    relations: ['module', 'book'],
  });

  const existingKeys = new Set(
    existingLinks.map((moduleBook) =>
      createLinkKey(moduleBook.module.id, moduleBook.book.id),
    ),
  );

  const toCreate: ModuleBook[] = [];
  let linksSkipped = 0;

  for (const row of rows) {
    const module = moduleByNormalisedCode.get(row.moduleCode);

    const book = bookByIsbn.get(row.isbn);

    if (!module || !book) continue;

    const key = createLinkKey(module.id, book.id);

    if (existingKeys.has(key)) {
      linksSkipped++;
      continue;
    }

    toCreate.push(
      moduleBookRepo.create({
        module,
        book,
      }),
    );

    existingKeys.add(key);
  }

  if (toCreate.length) {
    await moduleBookRepo.save(toCreate);
  }

  return {
    linksCreated: toCreate.length,
    linksSkipped,
  };
}

export async function seedModuleBooks(
  manager: EntityManager,
): Promise<SeedModuleBooksResult> {
  const logger = new Logger(seedModuleBooks.name);

  const moduleBookRepo = manager.getRepository(ModuleBook);

  const moduleRepo = manager.getRepository(Module);

  const bookRepo = manager.getRepository(Book);

  const rows = buildSeedRows();

  if (!rows.length) {
    return createEmptyResult();
  }

  const normalisedCodes = [...new Set(rows.map((row) => row.moduleCode))];

  const allModules = await moduleRepo.find();

  const moduleByNormalisedCode = createModuleMap(allModules);

  const missingModules = findMissingModules(
    normalisedCodes,
    moduleByNormalisedCode,
  );

  logMissingModules(logger, missingModules);

  const isbns = [...new Set(rows.map((row) => row.isbn))];

  const existingBooks = await bookRepo.find({
    where: {
      isbn: In(isbns),
    },
  });

  const { bookByIsbn, booksCreated, booksUpdated } = await processBooks(
    bookRepo,
    rows,
    existingBooks,
  );

  const { linksCreated, linksSkipped } = await createModuleBookLinks(
    moduleBookRepo,
    rows,
    moduleByNormalisedCode,
    bookByIsbn,
  );

  const result: SeedModuleBooksResult = {
    booksCreated,
    booksUpdated,
    linksCreated,
    linksSkipped,
    missingModules,
  };

  logger.log(
    `Module-book seed: books +${booksCreated}/~${booksUpdated}; ` +
      `links +${linksCreated}/~${linksSkipped}; ` +
      `missing modules: ${missingModules.length}`,
  );

  return result;
}
