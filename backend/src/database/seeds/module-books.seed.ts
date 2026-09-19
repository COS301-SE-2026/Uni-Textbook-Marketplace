import { EntityManager, In } from 'typeorm';
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

function normaliseCode(code: string): string {
  return code.replace(/\s+/g, '').toUpperCase();
}

function parseEdition(
  value: string | number | null | undefined,
): number | undefined {
  if (value == null) return undefined;
  if (typeof value === 'number') return value;
  const match = value.match(/\d+/);
  return match ? parseInt(match[0], 10) : undefined;
}

function buildSeedRows(): SeedRow[] {
  const raw = rawModules as { modules: RawModule[] };
  const rows: SeedRow[] = [];

  for (const entry of raw.modules) {
    const moduleCode = normaliseCode(entry.module);

    for (const tb of entry.textbooks) {
      if (!tb.isbn13) continue;

      const isbns = tb.isbn13
        .split('/')
        .map((s) =>
          s
            .trim()
            .replace(/\s*\(.*\)$/, '')
            .replace(/EP$/i, ''),
        )
        .filter((s) => ISBN_PATTERN.test(s));

      for (const isbn of isbns) {
        rows.push({
          moduleCode,
          isbn,
          title: tb.title,
          author: tb.authors ?? undefined,
          edition: parseEdition(tb.edition),
        });
      }
    }
  }

  return rows;
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
    return {
      booksCreated: 0,
      booksUpdated: 0,
      linksCreated: 0,
      linksSkipped: 0,
      missingModules: [],
    };
  }

  const normalisedCodes = [...new Set(rows.map((r) => r.moduleCode))];

  const allModules = await moduleRepo.find();
  const moduleByNormalisedCode = new Map(
    allModules.map((m) => [normaliseCode(m.code), m]),
  );

  const missingModules = normalisedCodes.filter(
    (c) => !moduleByNormalisedCode.has(c),
  );
  if (missingModules.length) {
    logger.warn(
      `${missingModules.length} module codes in seed data have no matching Module row: ` +
        missingModules.slice(0, 10).join(', ') +
        (missingModules.length > 10 ? ' …' : ''),
    );
  }

  const isbns = [...new Set(rows.map((r) => r.isbn))];
  const existingBooks = await bookRepo.find({ where: { isbn: In(isbns) } });
  const bookByIsbn = new Map(existingBooks.map((b) => [b.isbn, b]));

  let booksCreated = 0;
  let booksUpdated = 0;

  for (const row of rows) {
    const existing = bookByIsbn.get(row.isbn);

    if (!existing) {
      const created = bookRepo.create({
        isbn: row.isbn,
        title: row.title,
        author: row.author,
        edition: row.edition,
      });
      const saved = await bookRepo.save(created);
      bookByIsbn.set(row.isbn, saved);
      booksCreated++;
      continue;
    }

    const needsUpdate =
      existing.title !== row.title ||
      (row.author !== undefined && existing.author !== row.author) ||
      (row.edition !== undefined && existing.edition !== row.edition);

    if (needsUpdate) {
      existing.title = row.title;
      if (row.author !== undefined) existing.author = row.author;
      if (row.edition !== undefined) existing.edition = row.edition;
      const saved = await bookRepo.save(existing);
      bookByIsbn.set(row.isbn, saved);
      booksUpdated++;
    }
  }

  const validModuleIds = allModules.map((m) => m.id);
  const validBookIds = [...bookByIsbn.values()].map((b) => b.id);

  const existingLinks = await moduleBookRepo.find({
    where: {
      module: { id: In(validModuleIds) },
      book: { id: In(validBookIds) },
    },
    relations: ['module', 'book'],
  });
  const existingKeys = new Set(
    existingLinks.map((mb) => `${mb.module.id}::${mb.book.id}`),
  );

  const toCreate: ModuleBook[] = [];
  let linksSkipped = 0;

  for (const row of rows) {
    const module = moduleByNormalisedCode.get(row.moduleCode);
    if (!module) continue;

    const book = bookByIsbn.get(row.isbn);
    if (!book) continue;

    const key = `${module.id}::${book.id}`;
    if (existingKeys.has(key)) {
      linksSkipped++;
      continue;
    }

    toCreate.push(moduleBookRepo.create({ module, book }));
    existingKeys.add(key);
  }

  if (toCreate.length) {
    await moduleBookRepo.save(toCreate);
  }

  const result: SeedModuleBooksResult = {
    booksCreated,
    booksUpdated,
    linksCreated: toCreate.length,
    linksSkipped,
    missingModules,
  };

  logger.log(
    `Module-book seed: books +${booksCreated}/~${booksUpdated}; ` +
      `links +${toCreate.length}/~${linksSkipped}; ` +
      `missing modules: ${missingModules.length}`,
  );

  return result;
}
