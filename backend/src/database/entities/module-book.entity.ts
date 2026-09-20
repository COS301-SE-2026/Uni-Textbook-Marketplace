import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Module } from './module.entity';
import { Book } from './book.entity';

@Entity('module_books')
@Unique(['module', 'book'])
export class ModuleBook {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Module, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'module_id' })
  module!: Module;

  @ManyToOne(() => Book, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'book_id' })
  book!: Book;
}