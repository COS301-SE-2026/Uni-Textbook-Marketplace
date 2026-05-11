import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm';

import { University } from './university.entity';

@Entity('modules')
export class Module {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    unique: true,
    length: 20
  })
  code!: string;

  @Column()
  name!: string;

  @Column({
    nullable: true
  })
  faculty!: string;

  @Column({
    nullable: true
  })
  semester!: number;

  @ManyToOne(() => University, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'university_id' })
  university: University;
}