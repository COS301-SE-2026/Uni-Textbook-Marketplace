import { Test } from "@nestjs/testing";
import { BooksController } from "./books.controller";
import { BooksService } from "./books.service";

const mockBooksService = {
    create : jest.fn()
};

describe('BooksContoller', () => {

    let bookController: BooksController;
    let bookService: BooksService;

    beforeAll(async () => {

        const module = await Test.createTestingModule({
            controllers: [BooksController],
            providers: [
                {
                    provide: BooksService,
                    useValue: mockBooksService,
                },
            ],
        }).compile();

        bookController = module.get(BooksController);
        bookService = module.get(BooksService);
    });

    describe('Book Create', () => {

        const CreateBookDto = {
            isbn: '1234567890',
            title: 'Software engineering',
            author: 'lebo',
            edition: 2,
            publisher: 'gift'
        };

        const createdBook = {
            id: 1,
            ...CreateBookDto,
        };

        it('should call booksService.create ', async () => {

            mockBooksService.create.mockResolvedValue(createdBook);

            const result = await bookController.create(CreateBookDto);
            expect(mockBooksService.create).toHaveBeenCalledWith(CreateBookDto);
            expect(result).toEqual(createdBook);
        });
    })

});