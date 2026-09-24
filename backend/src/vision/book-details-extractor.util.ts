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

const FUNCTION_WORDS = new Set([
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

const BLOCK_GAP_RATIO = 0.6;

const MAX_AUTHOR_TOKENS = 8;

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

function looksNameShaped(text: string): boolean {
  const cleaned = text.replace(/^\s*by\s+/i, '').trim();
  if (!cleaned || /\d/.test(cleaned)) return false;

  const tokens = cleaned.split(/[,&·•]+|\band\b|\s+/).filter(Boolean);
  if (tokens.length === 0 || tokens.length > MAX_AUTHOR_TOKENS) return false;
  if (!tokens.every((t) => /^[A-Za-z][A-Za-z.'’-]*$/.test(t))) return false;

  return !tokens.some((t) => {
    const bare = t.toLowerCase().replace(/[.'’]/g, '');
    return FUNCTION_WORDS.has(bare) && !t.endsWith('.');
  });
}

interface Candidate {
  line: OcrLine;
  i: number;
}

interface Block {
  lines: Candidate[];
}

function groupIntoBlocks(candidates: Candidate[]): Block[] {
  const blocks: Block[] = [];
  let current: Block | null = null;
  let prevBottom: number | null = null;
  let prevHeight = 0;

  for (const c of candidates) {
    const avgHeight =
      prevBottom === null ? c.line.height : (prevHeight + c.line.height) / 2;
    const gap = prevBottom === null ? Infinity : c.line.topY - prevBottom;
    const startsNewBlock =
      current === null || gap > BLOCK_GAP_RATIO * avgHeight;

    if (startsNewBlock) {
      current = { lines: [] };
      blocks.push(current);
    }
    current!.lines.push(c);
    prevBottom = c.line.topY + c.line.height;
    prevHeight = c.line.height;
  }
  return blocks;
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

  const candidates: Candidate[] = lines
    .map((line, i) => ({ line, i }))
    .filter(
      ({ line, i }) =>
        !consumed.has(i) && line.text.replace(/[^A-Za-z]/g, '').length >= 2,
    )
    .sort((a, b) => a.line.topY - b.line.topY);
  if (candidates.length === 0) return result;

  const blocks = groupIntoBlocks(candidates);

  let titleBlockIndex = 0;
  let tallestSeen = -1;
  blocks.forEach((block, bi) => {
    for (const c of block.lines) {
      if (c.line.height > tallestSeen) {
        tallestSeen = c.line.height;
        titleBlockIndex = bi;
      }
    }
  });

  const titleBlock = blocks[titleBlockIndex];
  result.title = tidy(titleBlock.lines.map((c) => c.line.text).join(' '));

  const authorBlock = blocks[titleBlockIndex + 1];
  if (authorBlock) {
    const rawJoined = authorBlock.lines.map((c) => c.line.text).join(' ');
    if (looksNameShaped(rawJoined)) {
      result.author = authorBlock.lines
        .map((c) =>
          tidy(
            c.line.text
              .replace(/^\s*by\s+/i, '')
              .replace(/[ \t]*[·•][ \t]*/g, ', '),
          ),
        )
        .join(', ');
    }
  }

  return result;
}
