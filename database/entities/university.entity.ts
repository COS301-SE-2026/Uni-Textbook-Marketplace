import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany
} from 'typeorm';

import { User } from './user.entity';
import { Module } from './module.entity';

@Entity('universities')
export class University {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({
    unique: true
  })
  email_domain!: string;

  /*
    One university can have many users
  */
  @OneToMany(() => User, user => user.university)
  users!: User[];

  /*
    One university can offer many modules
  */
  @OneToMany(() => Module, (module : Module) => module.university)
  modules!: Module[];
}

