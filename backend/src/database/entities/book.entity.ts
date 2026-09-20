import { Entity, PrimaryGeneratedColumn, Column, Index , OneToMany } from 'typeorm';
import { ModuleBook } from './module-book.entity';

@Entity('books')
@Index('idx_books_isbn', ['isbn'])
@Index('idx_books_author_title', ['author', 'title'])
@Index('idx_books_edition', ['edition'])
@Index('idx_books_title', ['title'])
export class Book {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    length: 20,
    unique: true,
    nullable: true,
  })
  isbn!: string;

  @Column()
  title!: string;

  @Column({
    nullable: true,
  })
  author!: string;

  @Column({
    nullable: true,
  })
  edition!: number;

  @Column({
    nullable: true,
  })
  publisher!: string;

  @OneToMany(() => ModuleBook, (moduleBook) => moduleBook.book)
moduleBooks?: ModuleBook[];
}
