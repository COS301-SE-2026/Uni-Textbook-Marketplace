import { OcrLine, isValidIsbn, normaliseText } from './book-matcher.util';

export interface ExtractedBookDetails {
  title: string | null;
  author: string | null;
  edition: string | null;
  isbn: string | null;
  publisher: string | null;
}

const ORDINALS: Record<string, number> = {
  first: 1,
  second: 2,
  third: 3,
  fourth: 4,
  fifth: 5,
  sixth: 6,
  seventh: 7,
  eighth: 8,
  ninth: 9,
  tenth: 10,
  eleventh: 11,
  twelfth: 12,
  thirteenth: 13,
  fourteenth: 14,
  fifteenth: 15,
  sixteenth: 16,
  seventeenth: 17,
  eighteenth: 18,
  nineteenth: 19,
  twentieth: 20,
};

const EDITION_FILLER = new Set([
  'edition',
  'ed',
  'global',
  'international',
  'revised',
  'updated',
  'new',
]);

const PUBLISHERS: { pattern: RegExp; name: string }[] = [
  { pattern: /\bmc ?graw ?hill\b/, name: 'McGraw Hill' },
  { pattern: /\bpearson\b/, name: 'Pearson' },
  { pattern: /\bwiley\b/, name: 'Wiley' },
  { pattern: /\bcengage\b/, name: 'Cengage' },
  { pattern: /\boxford university press\b/, name: 'Oxford University Press' },
  {
    pattern: /\bcambridge university press\b/,
    name: 'Cambridge University Press',
  },
  { pattern: /\bspringer\b/, name: 'Springer' },
  { pattern: /\belsevier\b/, name: 'Elsevier' },
  { pattern: /\bmacmillan\b/, name: 'Macmillan' },
  { pattern: /\bprentice hall\b/, name: 'Prentice Hall' },
  { pattern: /\baddison ?wesley\b/, name: 'Addison-Wesley' },
  { pattern: /\bo reilly\b/, name: "O'Reilly" },
  { pattern: /\btaylor (and )?francis\b/, name: 'Taylor & Francis' },
  { pattern: /\broutledge\b/, name: 'Routledge' },
  { pattern: /\bharpercollins\b/, name: 'HarperCollins' },
  { pattern: /\bbrooks ?cole\b/, name: 'Brooks/Cole' },
  { pattern: /\bjuta\b/, name: 'Juta' },
  { pattern: /\bvan schaik\b/, name: 'Van Schaik' },
];

const NOT_A_NAME = new Set([
  'edition',
  'university',
  'press',
  'education',
  'international',
  'global',
  'study',
  'guide',
  'volume',
  'introduction',
  'principles',
  'fundamentals',
  'handbook',
  'workbook',
  'bestseller',
  'isbn',
]);

const NOT_IN_A_NAME = new Set([
  'a',
  'an',
  'the',
  'of',
  'to',
  'in',
  'for',
  'with',
  'on',
]);

const TITLE_HEIGHT_CLUSTER = 0.7;
const AUTHOR_MAX_HEIGHT = 0.75;
const MAX_AUTHOR_LINES = 6;

function tidy(text: string): string {
  const t = text.trim().replace(/\s+/g, ' ');
  const letters = t.replace(/[^A-Za-z]/g, '');
  if (letters?.length && letters === letters.toUpperCase()) {
    return t
      .toLowerCase()
      .replace(/(^|[\s(-])([a-z])/g, (_m, p, c: string) => p + c.toUpperCase());
  }
  return t;
}

function numberFromToken(
  token: string,
  allowBareDigits: boolean,
): number | null {
  if (token in ORDINALS) return ORDINALS[token];
  const suffixed = /^(\d{1,2})(st|nd|rd|th)$/.exec(token);
  if (suffixed) return Number(suffixed[1]);
  if (allowBareDigits && /^\d{1,2}$/.test(token)) return Number(token);
  return null;
}

function parseEditionLine(norm: string): {
  edition: number | null;
  consumed: boolean;
} {
  const tokens = norm.split(' ').filter(Boolean);
  if (tokens.length === 0) return { edition: null, consumed: false };

  const editionish = tokens.every(
    (t) => EDITION_FILLER.has(t) || numberFromToken(t, false) !== null,
  );
  if (editionish) {
    const found =
      tokens.map((t) => numberFromToken(t, false)).find((n) => n !== null) ??
      null;
    return { edition: found, consumed: true };
  }

  const idx = tokens.findIndex((t) => t === 'edition' || t === 'ed');
  if (idx !== -1) {
    const around = [tokens[idx - 1], tokens[idx + 1]].filter(Boolean);
    for (const t of around) {
      const n = numberFromToken(t, true);
      if (n !== null) return { edition: n, consumed: true };
    }
    if (tokens[idx] === 'edition') return { edition: null, consumed: true };
  }
  return { edition: null, consumed: false };
}

function findIsbn(lines: OcrLine[]): {
  isbn: string | null;
  consumed: Set<number>;
} {
  const consumed = new Set<number>();
  const pattern = /\d[\d\s-]{8,15}[\dXx]/g;

  const check = (text: string): string | null => {
    for (const candidate of text.match(pattern) ?? []) {
      const digits = candidate.replace(/[^0-9Xx]/g, '').toUpperCase();
      if (isValidIsbn(digits)) return digits;
    }
    return null;
  };

  let isbn: string | null = null;
  lines.forEach((line, i) => {
    const found = check(line.text);
    if (found) {
      isbn ??= found;
      consumed.add(i);
    } else if (/\bisbn\b/i.test(line.text)) {
      consumed.add(i);
    }
  });

  isbn ??= check(lines.map((l) => l.text).join(' '));
  return { isbn, consumed };
}

function looksLikeName(text: string): boolean {
  const cleaned = text.replace(/^\s*by\s+/i, '').trim();
  if (!cleaned || /\d/.test(cleaned)) return false;

  const parts = cleaned.split(/[,/&]|\band\b|\s+/).filter(Boolean);
  if (parts.length === 0 || parts.length > MAX_AUTHOR_LINES) return false;
  if (!parts.every((p) => /^[A-Za-z][A-Za-z.'’-]*$/.test(p))) return false;
  return !parts.some((p) => {
    const bare = p.toLowerCase().replace(/[.'’]/g, '');

    return (
      NOT_A_NAME.has(bare) || (NOT_IN_A_NAME.has(bare) && !p.endsWith('.'))
    );
  });
}

export function extractBookDetails(lines: OcrLine[]): ExtractedBookDetails {
  const result: ExtractedBookDetails = {
    title: null,
    author: null,
    edition: null,
    isbn: null,
    publisher: null,
  };
  if (lines.length === 0) return result;

  const { isbn, consumed } = findIsbn(lines);
  result.isbn = isbn;

  lines.forEach((line, i) => {
    if (consumed.has(i)) return;
    const norm = normaliseText(line.text);

    const publisher = PUBLISHERS.find((p) => p.pattern.test(norm));
    if (publisher) {
      result.publisher ??= publisher.name;
      consumed.add(i);
      return;
    }

    const { edition, consumed: isEditionLine } = parseEditionLine(norm);
    if (isEditionLine) {
      if (edition !== null && edition >= 1 && edition <= 30) {
        result.edition ??= String(edition);
      }
      consumed.add(i);
    }
  });

  const candidates = lines
    .map((line, i) => ({ line, i }))
    .filter(
      ({ line, i }) =>
        !consumed.has(i) && line.text.replace(/[^A-Za-z]/g, '').length >= 3,
    )
    .sort((a, b) => a.line.topY - b.line.topY);
  if (candidates.length === 0) return result;

  const tallest = candidates.reduce((best, c) =>
    c.line.height > best.line.height ? c : best,
  );
  const seed = candidates.indexOf(tallest);
  const minHeight = tallest.line.height * TITLE_HEIGHT_CLUSTER;

  let first = seed;
  while (first > 0 && candidates[first - 1].line.height >= minHeight) first--;
  let last = seed;
  while (
    last < candidates.length - 1 &&
    candidates[last + 1].line.height >= minHeight
  )
    last++;

  const titleLines = candidates.slice(first, last + 1);
  result.title = tidy(titleLines.map((c) => c.line.text).join(' '));

  const titleBottom = titleLines[titleLines.length - 1].line.topY;
  const authorLines = candidates
    .slice(last + 1)
    .filter(
      ({ line }) =>
        line.topY > titleBottom &&
        line.height <= tallest.line.height * AUTHOR_MAX_HEIGHT &&
        looksLikeName(line.text),
    )
    .slice(0, MAX_AUTHOR_LINES)
    .map(({ line }) => tidy(line.text.replace(/^\s*by\s+/i, '')));

  if (authorLines.length > 0) result.author = authorLines.join(', ');

  return result;
}
