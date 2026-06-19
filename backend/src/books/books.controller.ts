import { Body, Controller, Post } from '@nestjs/common';

import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create.book.dto';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  async create(@Body() dto: CreateBookDto) {
    return await this.booksService.create(dto);
  }
}
