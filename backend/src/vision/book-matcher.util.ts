import { Book } from '../../books/entities/book.entity';

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
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return isValidIsbn10(digits);
  if (digits.length === 13) return isValidIsbn13(digits);
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
