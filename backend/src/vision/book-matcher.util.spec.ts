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


    

})