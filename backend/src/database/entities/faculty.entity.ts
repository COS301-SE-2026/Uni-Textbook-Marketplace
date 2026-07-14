import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { University } from './university.entity';

@Entity('faculties')
export class Faculty {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  name!: string;

  @ManyToOne(() => University, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'university_id' })
  university!: University;

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'NOW()',
  })
  created_at!: Date;
}
