import {
  Entity,
  PrimaryGeneratedColumn,
  Column
} from 'typeorm';

@Entity('books')
export class Book {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    length: 13,
    unique: true,
    nullable: true
  })
  isbn!: string;

  @Column()
  title!: string;

  @Column({
    nullable: true
  })
  author!: string;

  @Column({
    nullable: true
  })
  edition!: number;

  @Column({
    nullable: true
  })
  publisher!: string;
}