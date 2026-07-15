import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { University } from './university.entity';
import { Faculty } from './faculty.entity';

@Entity('modules')
export class Module {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    unique: true,
    length: 20,
  })
  code!: string;

  @Column()
  name!: string;

  @ManyToOne(() => Faculty, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'faculty_id' })
  faculty!: Faculty;

  @Column({
    nullable: true,
  })
  semester!: number;

  @ManyToOne(() => University, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'university_id' })
  university!: University;
}
