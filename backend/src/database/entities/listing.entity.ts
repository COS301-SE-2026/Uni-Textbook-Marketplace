import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

import { User } from './users.entity';
import { Book } from './book.entity';
import { Module } from './module.entity';

export enum ListingStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SOFT_DELETED = 'SOFT_DELETED',
}

export enum ListingsStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  SOLD = 'SOLD',
  WITHDRAWN = 'WITHDRAWN',
}

@Entity('listings')
@Index('idx_listings_module_price', ['module', 'price'])
@Index('idx_listings_condition', ['condition'])
@Index('idx_listings_annotation', ['annotation_level'])
@Index('idx_listing_status', ['status'])
@Index('idx_listing_seller', ['seller'])
@Index('idx_listing_reviewed_by', ['reviewer'])
@Index('idx_listings_created_at', ['created_at'])
export class Listing {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 200, nullable: true })
  title!: string;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'seller_id' })
  seller: User;

  @ManyToOne(() => Book, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'book_id' })
  book: Book;

  @ManyToOne(() => Module, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'module_id' })
  module: Module | null;

  @Column({
    type: 'enum',
    enum: ['new', 'good', 'fair', 'poor'],
  })
  condition!: string;

  @Column({
    type: 'enum',
    enum: ['none', 'light', 'heavy'],
  })
  annotation_level!: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  price!: number;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'reviewed_by' })
  reviewer: User;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  reviewed_at!: Date;

  @Column('text', {
    array: true,
    default: [],
  })
  photo_urls!: string[];

  @Column({
    type: 'enum',
    enum: ListingStatus,
    default: ListingStatus.PENDING,
  })
  status!: ListingStatus;

  @Column({
    type: 'enum',
    enum: ListingsStatus,
    default: ListingsStatus.AVAILABLE,
  })
  listing_status!: ListingsStatus;

  @Column({
    default: false,
  })
  has_notes!: boolean;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  created_at!: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    nullable: true,
  })
  updated_at!: Date;

  @DeleteDateColumn({
    type: 'timestamptz',
    nullable: true,
  })
  deleted_at!: Date;

  @Column({type : 'text',nullable : true})
  description: string
}
