import { OcrLine } from './book-matcher.util';
import { extractBookDetails } from './book-details-extractor.util';

const makeLine = (text: string, topY = 0, height = 20): OcrLine => ({
  text,
  topY,
  height,
});

describe('extractBookDetails', () => {

  it('returns all-null for empty input', () => {
    expect(extractBookDetails([])).toEqual({
      title: null,
      author: null,
      edition: null,
      isbn: null,
      publisher: null,
    });
  });

  it('extracts a valid ISBN-13', () => {


    const lines = [makeLine('Some title'), makeLine('ISBN 978-0-13-397077-7')];

    expect(extractBookDetails(lines).isbn).toBe('9780133970777');
  });

  it('extracts a valid ISBN-10 ending in X', () => {

    expect(extractBookDetails([makeLine('097522980X')]).isbn).toBe('097522980X');
  });

  it('ignores an invalid ISBN-shaped string', () => {
    expect(extractBookDetails([makeLine('978-1234567890')]).isbn).toBeNull();
  });

  it('finds an ISBN split across lines', () => {
    const lines = [makeLine('978-0-13'), makeLine('397077-7')];


    expect(extractBookDetails(lines).isbn).toBe('9780133970777');
  });

  it.each([
    ['McGraw Hill',        'McGraw-Hill Education',           'McGraw Hill'],
    ['Pearson',            'PEARSON',                          'Pearson'],
    ['Oxford UP',          'Oxford University Press',          'Oxford University Press'],
    ['O Reilly',           'O Reilly Media',                   "O'Reilly"],
    ['Van Schaik',         'Van Schaik Publishers',            'Van Schaik'],
  ])('detects publisher %s', (_label, ocr, expected) => {
    expect(extractBookDetails([makeLine(ocr)]).publisher).toBe(expected);
  });

  it.each([
    ['word ordinal',       'Second Edition',   '2'],
    ['numeric suffix',     '3rd Edition',      '3'],
    ['bare digit + ed',    '7 ed',             '7'],
    ['filler only line',   'Global Edition',   null],
  ])('parses edition: %s', (_label, ocr, expected) => {


    expect(extractBookDetails([makeLine(ocr)]).edition).toBe(expected);
  });

  it('rejects edition numbers outside 1–30', () => {

    expect(extractBookDetails([makeLine('45th Edition')]).edition).toBeNull();
  });

  it('extracts title from the tallest block', () => {
    const lines = [
      makeLine('Fundamentals of Database Systems', 0, 40),
      makeLine('Ramez Elmasri', 100, 12),
    ];
    expect(extractBookDetails(lines).title).toBe(
      'Fundamentals of Database Systems',
    );
  });

  it('extracts author from the block after the title', () => {


    const lines = [
      makeLine('Fundamentals of Database Systems', 0, 40),
      makeLine('Ramez Elmasri', 100, 12),
    ];
    expect(extractBookDetails(lines).author).toBe('Ramez Elmasri');
  });

  it('rejects an author block containing digits', () => {
    const lines = [
      makeLine('Fundamentals of Database Systems', 0, 40),
      makeLine('Ramez Elmasri 7th', 100, 12),
    ];
    expect(extractBookDetails(lines).author).toBeNull();
  });

  it('strips a leading "by" from the author', () => {


    const lines = [
      makeLine('Fundamentals of Database Systems', 0, 40),
      makeLine('by Ramez Elmasri', 100, 12),
    ];
    expect(extractBookDetails(lines).author).toBe('Ramez Elmasri');

    
  });

  it('title-cases an ALL-CAPS title', () => {
    const lines = [makeLine('FUNDAMENTALS OF DATABASE SYSTEMS', 0, 40)];
    expect(extractBookDetails(lines).title).toBe(
      'Fundamentals Of Database Systems',
    );
  });

  it('skips lines with too few letters', () => {
    const lines = [
      makeLine('##', 0, 10),
      makeLine('Fundamentals of Database Systems', 20, 40),
    ];
    expect(extractBookDetails(lines).title).toBe(
      'Fundamentals of Database Systems',
    );
  });

});