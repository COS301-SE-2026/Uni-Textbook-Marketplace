import { Book } from '../database/entities/book.entity';
import {
  OcrLine,
  authorScore,
  digitsOnly,
  isValidIsbn,
  matchBookFromText,
  normaliseText,
  similarity,
  titleScore,
} from './book-matcher.util';

const makeBook = (overrides: Partial<Book>): Book =>
  ({
    id: '00000000-0000-0000-0000-000000000000',
    isbn: null,
    title: '',
    author: null,
    edition: null,
    publisher: null,
    ...overrides,
  }) as Book;

const makeLine = (text: string, topY = 0, height = 20): OcrLine => ({
  text,
  topY,
  height,
});

describe('book-matcher.util', () => {

    describe('normaliseText', () => {
        it('lowercases and collapses whitespace', () => {


        expect(normaliseText('  Hello   WORLD  ')).toBe('hello world');
        });

        it('strips trailing ellipsis (single and unicode)', () => {

        expect(normaliseText('South African Constitutional Law In Cont...')).toBe(
            'south african constitutional law in cont',
        );
        expect(normaliseText('Something In Context…')).toBe(
            'something in context',
        );
        });

        it('replaces punctuation with spaces', () => {

        expect(normaliseText('Data-Structures & Algorithms')).toBe(
            'data structures algorithms',
        );
        });

        it('handles empty input', () => {

        expect(normaliseText('')).toBe('');
        });
    });

    describe('digitsOnly', () => {
        it('strips hyphens from ISBN', () => {

        expect(digitsOnly('978-0-13-397077-7')).toBe('9780133970777');
        });

        it('returns empty string for null / undefined', () => {

        expect(digitsOnly(null)).toBe('');


        expect(digitsOnly(undefined)).toBe('');
        });
    });

    describe('isValidIsbn', () => {
    it('accepts a valid ISBN-13', () => {
      expect(isValidIsbn('9780133970777')).toBe(true);
    });

    it('rejects the junk ISBN used in seed data', () => {
      
      expect(isValidIsbn('9781234567890')).toBe(false);
    });

    it('accepts a valid ISBN-10', () => {
      expect(isValidIsbn('0306406152')).toBe(true);
    });

    it('accepts ISBN-10 ending in X', () => {
      
      expect(isValidIsbn('097522980X')).toBe(true);
    });

    it('rejects strings of the wrong length', () => {
      expect(isValidIsbn('12345')).toBe(false);
      expect(isValidIsbn('')).toBe(false);
    });

    it('ignores separators when validating', () => {
      expect(isValidIsbn('978-0-13-397077-7')).toBe(true);
    });
  });


  describe('similarity', () => {
    it('returns 1 for identical strings', () => {
      expect(similarity('Software Engineering', 'Software Engineering')).toBe(
        1,
      );
    });

    it('is case- and punctuation-insensitive', () => {
      expect(similarity('Software Engineering', 'software engineering!')).toBe(1);
    });

    it('returns 0 when first argument is empty', () => {
      expect(similarity('', 'anything')).toBe(0);
    });

    it('returns 0 when second argument is empty', () => {
      expect(similarity('anything', '')).toBe(0);
    });

    it('returns a value between 0 and 1 for partial overlap', () => {
      const s = similarity('Introduction to Philosophy', 'Philosophy Intro');
      expect(s).toBeGreaterThan(0);
      expect(s).toBeLessThan(1);
    });

    it('scores unrelated strings low', () => {
      expect(similarity('Software Engineering', 'ISE Biology')).toBeLessThan(
        0.2,
      );
    });
  });




  describe('titleScore', () => {
    it('scores high when stored title is a prefix of OCR text', () => {
      
      const stored = 'South African Constitutional Law In Cont...';
      const ocr =
        'South African Constitutional Law In Context Pierre De Vos';
      const score = titleScore(ocr, stored);
      
      expect(score).toBeGreaterThan(0.6);
    });

    it('scores high when OCR text is contained in stored title', () => {
      const stored = 'Fundamentals of Database Systems';
      const ocr = 'Fundamentals of Database';
      expect(titleScore(ocr, stored)).toBeGreaterThan(0.6);
    });

    it('falls back to fuzzy similarity when no containment', () => {
      const score = titleScore(
        'Fundamentals of Database Systems',
        'Fundamentals of Databse Systems',
      );
      expect(score).toBeGreaterThan(0.7);
    });

    it('returns 0 when OCR candidate is empty', () => {
      expect(titleScore('', 'Fundamentals of Database Systems')).toBe(0);
    });

    it('returns 0 when stored title is empty', () => {
      expect(titleScore('Fundamentals of Database Systems', '')).toBe(0);
    });
  });


  describe('authorScore', () => {
    it('normalises "&" and "and"', () => {
      const a = authorScore(
        'Pierre De Vos & Warren Freedman',
        'Pierre De Vos and Warren Freedman',
      );
      expect(a).toBeGreaterThan(0.8);
    });

    it('returns 0 for empty author', () => {
      expect(authorScore('Some Author', '')).toBe(0);
    });
  });


  describe('matchBookFromText', () => {
    const stagingBooks: Book[] = [
      makeBook({
        id: 'b1',
        title: 'South African Constitutional Law In Cont...',
        author: 'Pierre De Vos & Warren Freedman',
        isbn: '978-0190746162',
        edition: 2,
      }),
      makeBook({
        id: 'b2',
        title: 'Fundamentals of Database Systems',
        author: 'Ramez Elmasri & Shamkant Navathe',
        isbn: '978-0133970777',
        edition: 7,
      }),
      makeBook({
        id: 'b3',
        title: 'Software',
        author: 'Anthony Debarros',
        isbn: '978-1234567890', 
        edition: -11,
      }),
      makeBook({
        id: 'b4',
        title: 'Economics For South African Students',
        author: 'Prof. Philip Mohr & Cecilia J. Van Zyl',
        isbn: '978-0627043475',
        edition: 7,
      }),
      makeBook({
        id: 'b5',
        title: 'ISE Biology',
        author: 'George Johnson, Jonathan Losos & Kenneth Mason',
        isbn: '978-1260565959',
        edition: 12,
      }),
    ];

    it('returns null when there are no candidates', () => {
      const lines = [makeLine('Fundamentals of Database Systems')];
      expect(matchBookFromText(lines, [])).toBeNull();
    });

    it('returns null for empty OCR lines', () => {
      expect(matchBookFromText([], stagingBooks)).toBeNull();
    });

    it('matches by exact valid ISBN (short-circuits)', () => {
      const lines = [
        makeLine('Some cover noise'),
        makeLine('ISBN 978-0133970777'),
      ];
      const result = matchBookFromText(lines, stagingBooks);
      expect(result).not.toBeNull();
      expect(result!.book.id).toBe('b2');
      expect(result!.confidence).toBe(1.0);
    });

    it('does NOT short-circuit on invalid ISBN that matches a junk row', () => {
      
      const lines = [makeLine('978-1234567890')];

      const result = matchBookFromText(lines, stagingBooks);
      if (result) {
        expect(result.confidence).toBeLessThan(1.0);
      }
    });

    it('matches by fuzzy title + author when no ISBN present', () => {
      const lines = [
        makeLine('Fundamentals of Database', 0, 40),
        makeLine('Systems', 45, 40),
        makeLine('Ramez Elmasri & Shamkant Navathe', 100, 15),
      ];
      const result = matchBookFromText(lines, stagingBooks);
      expect(result).not.toBeNull();


      expect(result!.book.id).toBe('b2');
      expect(result!.confidence).toBeGreaterThan(0.6);
    });

    it('handles the truncated-title case via containment', () => {
      const lines = [
        makeLine('South African Constitutional Law', 0, 40),
        makeLine('In Context', 45, 40),
        makeLine('Pierre De Vos & Warren Freedman', 100, 15),
      ];
      const result = matchBookFromText(lines, stagingBooks);

      expect(result).not.toBeNull();

      expect(result!.book.id).toBe('b1');
    });

    it('picks the best match when multiple candidates score', () => {
      
      const books: Book[] = [
        makeBook({
          id: 'first',
          title: 'ISE Biology',
          author: 'George Johnson',
          isbn: '978-1260565959',
        }),
        makeBook({
          id: 'second',
          title: 'Software',
          author: 'Anthony Debarros',
          isbn: undefined,
        }),
      ];
      const lines = [makeLine('Software', 0, 40)];
      const result = matchBookFromText(lines, books);
      expect(result).not.toBeNull();
      expect(result!.book.id).toBe('second');
    });

    it('returns null when best score is below threshold', () => {
      const lines = [makeLine('Quantum Mechanics For Engineers')];
      const result = matchBookFromText(lines, stagingBooks);
      expect(result).toBeNull();
    });

    it('ignores garbled / empty OCR output', () => {
      const lines = [makeLine('###'), makeLine('')];
      expect(matchBookFromText(lines, stagingBooks)).toBeNull();
    });

    it('prefers a valid-ISBN match over a fuzzy title match', () => {
      
      const lines = [
        makeLine('South African Constitutional Law In Context', 0, 40),
        makeLine('ISBN 978-0133970777', 200, 15),
      ];
      const result = matchBookFromText(lines, stagingBooks);
      expect(result).not.toBeNull();
      expect(result!.book.id).toBe('b2');
      expect(result!.confidence).toBe(1.0);
    });

    it('handles single-line OCR (no multi-line title)', () => {
      const lines = [makeLine('ISE Biology')];
      const result = matchBookFromText(lines, stagingBooks);
      expect(result).not.toBeNull();
      expect(result!.book.id).toBe('b5');
    });

    it('handles OCR lines with zero height without crashing', () => {
      const lines = [
        { text: 'Fundamentals of Database Systems', topY: 0, height: 0 },
      ];  
      const result = matchBookFromText(lines, stagingBooks);
      expect(result).not.toBeNull();
      expect(result!.book.id).toBe('b2');
    });

    it('handles fewer than 4 lines (exercises tallest-lines slice)', () => {
      const lines = [
        makeLine('Fundamentals of', 0, 40),
        makeLine('Database Systems', 45, 40),
      ];
      const result = matchBookFromText(lines, stagingBooks);
      expect(result).not.toBeNull();
      expect(result!.book.id).toBe('b2');
    });

    it('handles lines with identical heights (tie-break sort)', () => {
      const lines = [
        makeLine('Fundamentals of', 0, 20),
        makeLine('Database Systems', 25, 20),
        makeLine('Ramez Elmasri', 50, 20),
      ];
      const result = matchBookFromText(lines, stagingBooks);
      expect(result).not.toBeNull();
    });
  });

})