import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Check,
} from 'typeorm';

import { User } from './users.entity';

@Entity('cases')
@Check(`status IN ('pending', 'upheld', 'reversed')`)
@Index('idx_cases_user_id', ['user_id'])
@Index('idx_cases_status', ['status'])
@Index('idx_cases_user_status', ['user_id', 'status'])
@Index('idx_cases_reviewed_by', ['reviewed_by'])
@Index('idx_cases_created_at', ['created_at'])
export class Case {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  user_id!: string;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({
    type: 'text',
    nullable: true,
  })
  appeal_message!: string | null;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'pending',
  })
  status!: string;

  @Column({ name: 'reviewed_by', nullable: true })
  reviewed_by!: string | null;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'reviewed_by' })
  reviewer!: User | null;

  @Column({
    name: 'reviewed_at',
    type: 'timestamptz',
    nullable: true,
  })
  reviewed_at!: Date | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  created_at!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    nullable: true,
  })
  updated_at!: Date | null;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    nullable: true,
  })
  deleted_at!: Date | null;
}
