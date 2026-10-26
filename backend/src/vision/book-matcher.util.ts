import { Book } from '../database/entities/book.entity';

export interface OcrLine {
  text: string;
  topY: number;
  height: number;
}

export interface BookMatchResult {
  book: Book;
  confidence: number;
}

const CONFIDENCE_THRESHOLD = 0.6;

export function normaliseText(input: string): string {
  return input
    .replace(/[.…]+$/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isValidIsbn(raw: string): boolean {
  const cleaned = raw.replace(/[^0-9Xx]/g, '').toUpperCase();
  if (cleaned.length === 10) return isValidIsbn10(cleaned);
  if (cleaned.length === 13) return isValidIsbn13(cleaned);
  return false;
}

function isValidIsbn13(d: string): boolean {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += Number(d[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;
  return check === Number(d[12]);
}

function isValidIsbn10(d: string): boolean {
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(d[i]) * (10 - i);
  const last = d[9] === 'X' ? 10 : Number(d[9]);
  return (sum + last) % 11 === 0;
}

export function digitsOnly(raw: string | null | undefined): string {
  return (raw ?? '').replace(/\D/g, '');
}

export function similarity(a: string, b: string): number {
  const A = normaliseText(a);
  const B = normaliseText(b);
  if (!A || !B) return 0;
  if (A === B) return 1;

  const bigrams = (s: string): Map<string, number> => {
    const m = new Map<string, number>();
    for (let i = 0; i < s.length - 1; i++) {
      const g = s.slice(i, i + 2);
      m.set(g, (m.get(g) ?? 0) + 1);
    }
    return m;
  };

  const aB = bigrams(A);
  const bB = bigrams(B);
  let overlap = 0;
  for (const [g, countA] of aB) {
    const countB = bB.get(g) ?? 0;
    overlap += Math.min(countA, countB);
  }
  const total = A.length - 1 + (B.length - 1);
  return total > 0 ? (2 * overlap) / total : 0;
}

export function titleScore(ocrCandidate: string, storedTitle: string): number {
  const sim = similarity(ocrCandidate, storedTitle);
  const a = normaliseText(ocrCandidate);
  const b = normaliseText(storedTitle);

  if (!a || !b) return sim;

  const contains = a.includes(b) || b.includes(a);
  const containsScore = contains
    ? Math.min(a.length, b.length) / Math.max(a.length, b.length)
    : 0;

  return Math.max(sim, containsScore);
}

export function authorScore(
  ocrCandidate: string,
  storedAuthor: string,
): number {
  const normalised = (s: string) =>
    normaliseText(s)
      .replace(/\band\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  return similarity(normalised(ocrCandidate), normalised(storedAuthor));
}

const STOPWORDS = new Set([
  'the',
  'of',
  'and',
  'a',
  'an',
  'to',
  'in',
  'for',
  'with',
  'on',
]);

function tokenise(input: string): string[] {
  return normaliseText(input)
    .split(' ')
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));
}

export function titleCoverage(
  ocrTokens: Set<string>,
  storedTitle: string,
): number {
  const tokens = tokenise(storedTitle);
  if (tokens.length === 0) return 0;
  return tokens.filter((t) => ocrTokens.has(t)).length / tokens.length;
}

export function authorCoverage(
  ocrTokens: Set<string>,
  storedAuthor: string,
): number {
  const tokens = tokenise(storedAuthor).filter((t) => t.length > 2);
  if (tokens.length === 0) return 0;
  const matched = tokens.filter((t) => ocrTokens.has(t)).length;
  return Math.min(1, matched / Math.min(tokens.length, 3));
}

function buildTitleCandidates(lines: OcrLine[]): string[] {
  if (lines.length === 0) return [];

  const sortedByY = [...lines].sort((a, b) => a.topY - b.topY);
  const full = sortedByY.map((l) => l.text).join(' ');

  const maxY = Math.max(...lines.map((l) => l.topY + l.height));
  const cutoff = maxY * 0.6;
  const topRegion = sortedByY
    .filter((l) => l.topY < cutoff)
    .map((l) => l.text)
    .join(' ');

  const tallest = [...lines]
    .sort((a, b) => b.height - a.height)
    .slice(0, 4)
    .sort((a, b) => a.topY - b.topY)
    .map((l) => l.text)
    .join(' ');

  return Array.from(new Set([full, topRegion, tallest])).filter(Boolean);
}

export function matchBookFromText(
  lines: OcrLine[],
  candidates: Book[],
): BookMatchResult | null {
  if (candidates.length === 0) return null;

  const titleCandidates = buildTitleCandidates(lines);
  const ocrText = lines.map((l) => l.text).join(' ');
  const ocrDigits = digitsOnly(ocrText);
  const ocrTokens = new Set(tokenise(ocrText));

  if (ocrDigits.length === 10 || ocrDigits.length === 13) {
    for (const book of candidates) {
      const bookDigits = digitsOnly(book.isbn);
      if (!bookDigits || bookDigits !== ocrDigits) continue;
      if (!isValidIsbn(bookDigits)) continue;
      return { book, confidence: 1.0 };
    }
  }

  let best: BookMatchResult | null = null;
  for (const book of candidates) {
    const similarityTitle = Math.max(
      ...titleCandidates.map((t) => titleScore(t, book.title)),
      0,
    );
    const authorCov = book.author ? authorCoverage(ocrTokens, book.author) : 0;
    const auth = book.author
      ? Math.max(authorScore(ocrText, book.author), authorCov)
      : 0;

    const titleCov = titleCoverage(ocrTokens, book.title);
    const coverageTitle = authorCov >= 0.5 ? titleCov : Math.min(titleCov, 0.5);

    const bestTitle = Math.max(similarityTitle, coverageTitle);
    const score = 0.7 * bestTitle + 0.3 * auth;

    if (score >= CONFIDENCE_THRESHOLD && (!best || score > best.confidence)) {
      best = { book, confidence: score };
    }
  }
  return best;
}
