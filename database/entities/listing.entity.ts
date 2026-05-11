import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn
} from 'typeorm';

import { User } from './user.entity';
import { Book } from './book.entity';
import { Module } from './module.entity';

export enum ListingStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SOFT_DELETED = 'SOFT_DELETED'
}

@Entity('listings')
export class Listing {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200, nullable: true })
  title: string;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'seller_id' })
  seller: User;

  @ManyToOne(() => Book, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'book_id' })
  book: Book;

  @ManyToOne(() => Module, {
    nullable: true,
    onDelete: 'SET NULL'
  })
  @JoinColumn({ name: 'module_id' })
  module: Module;

  @Column({
  type: 'enum',
  enum: ['new', 'good', 'fair', 'poor']
})
condition: string;

@Column({
  type: 'enum',
  enum: ['none','light','heavy']
})
annotation_level: string;



@Column({
    type: 'decimal',
    precision: 10,
    scale: 2
  })
  price: number;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL'
  })
  @JoinColumn({ name: 'reviewed_by' })
  reviewer: User;

  @Column({
    type: 'timestamptz',
    nullable: true
  })
  reviewed_at: Date;

  @Column('text', {
    array: true,
    default: []
  })
  photo_urls: string[];

  @Column({
    type: 'enum',
    enum: ListingStatus,
    default: ListingStatus.PENDING
  })
  status: ListingStatus;

  @Column({
    default: false
  })
  has_notes: boolean;

  @CreateDateColumn({
    type: 'timestamptz'
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    nullable: true
  })
  updated_at: Date;

  @DeleteDateColumn({
    type: 'timestamptz',
    nullable: true
  })
  deleted_at: Date;
}