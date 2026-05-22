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

  @Column({ nullable: true })
  faculty!: string;

  @Column({ default: false })
  is_verified!: boolean;

  @Column({
    type: 'varchar',
    default: 'student',
  })
  role!: string;

  /*
    university_id UUID REFERENCES universities(id)
  */
  @ManyToOne(() => University, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'university_id' })
  university!: University;

  /*
    listings sold by this user
  */
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
}
