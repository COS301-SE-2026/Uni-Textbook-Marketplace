import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import { User } from './users.entity';

export interface SavedSearchFilters {
  module?: string;
  price_min?: number;
  price_max?: number;
  condition?: string;
  annotation_level?: string;
  book_title?: string;
  author?: string;
  isbn?: string;
  university_id?: string;
  faculty_id?: string;
}

@Entity('saved_searches')
@Index('idx_saved_searches_user_id', ['user_id'])
@Index('idx_saved_searches_created_at', ['created_at'])
export class SavedSearch {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  user_id!: string;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({
    type: 'jsonb',
    nullable: false,
  })
  filter_json!: SavedSearchFilters;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  created_at!: Date;
}
