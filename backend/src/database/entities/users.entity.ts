import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

import { University } from './university.entity';
import { Listing } from './listing.entity';
import { Faculty } from './faculty.entity';
import { Report } from './report.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password_hash!: string;

  @Column()
  first_name!: string;

  @Column()
  last_name!: string;

  @Column({ default: false })
  is_verified!: boolean;

  @Column({
    type: 'varchar',
    default: 'student',
  })
  role!: string;

  @ManyToOne(() => University, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'university_id' })
  university!: University;

  @ManyToOne(() => Faculty, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'faculty_id' })
  faculty!: Faculty | null;

  @OneToMany(() => Listing, (listing: Listing) => listing.seller)
  listings!: Listing[];

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

  @OneToMany(() => Report, (report) => report.reporter)
  reports!: Report[];

  @Column({
    default: false,
  })
  is_banned!: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  banned_at!: Date | null;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'banned_by' })
  banned_by!: User | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  ban_reason!: string | null;
}
