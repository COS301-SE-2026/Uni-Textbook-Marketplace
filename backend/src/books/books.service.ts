import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Book } from '.././database/entities/book.entity';
import { CreateBookDto } from './dto/create.book.dto';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepo: Repository<Book>,
  ) {}

  async create(dto: CreateBookDto): Promise<Book> {
    if (dto.isbn) {
      const existing = await this.bookRepo.findOne({
        where: { isbn: dto.isbn },
      });
      if (existing) return existing;
    }

    const book = this.bookRepo.create(dto);
    return await this.bookRepo.save(book);
  }
}
