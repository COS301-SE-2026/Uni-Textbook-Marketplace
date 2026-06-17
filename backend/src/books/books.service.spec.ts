import { Test, TestingModule} from "@nestjs/testing";
import { BooksService } from "./books.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Book } from "../database/entities/book.entity"


describe('bookService', () => {

    let bookService: BooksService; 

    const mockBookRespiratory = {
        findOne : jest.fn(),
        create : jest.fn(),
        save : jest.fn()
    }

    beforeEach(async () => {

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BooksService,
                {
                    provide: getRepositoryToken(Book),
                    useValue: mockBookRespiratory,
                }
            ]

        }).compile();

        bookService = module.get<BooksService>(BooksService);
        jest.clearAllMocks();
    });

    //create a book
    describe('create book', () => {

        const existingBook = {
            id: 1,
            isbn: '1234567890',
            title: 'Software engineering',
            author: 'lebo',
            edition: 2,
            publisher: 'gift'
        }

        const dto = {
            isbn: '1234567890',
            title: 'Software engineering',
            author: 'lebo',
            edition: 2,
            publisher: 'gift'
        }

        it('it should return existing book if isbn exist', async () => {

            mockBookRespiratory.findOne.mockResolvedValue(existingBook);
            const bookResult = await bookService.create(dto);

            expect(mockBookRespiratory.findOne).toHaveBeenCalled();
            expect(mockBookRespiratory.save).not.toHaveBeenCalled();
            expect(bookResult).toEqual(existingBook);

        });

        it('it should create a new book', async () => {

            mockBookRespiratory.findOne.mockResolvedValue(null);
            mockBookRespiratory.create.mockReturnValue(existingBook);
            mockBookRespiratory.save.mockResolvedValue(existingBook);

            const Bookre = await bookService.create(dto);

            expect(mockBookRespiratory.findOne).toHaveBeenCalledWith({
                where: {isbn: dto.isbn},
            });
            expect(mockBookRespiratory.create).toHaveBeenCalledWith(dto);
            expect(mockBookRespiratory.save).toHaveBeenCalledWith(existingBook);
            expect(Bookre).toEqual(existingBook);
        });
    });
});