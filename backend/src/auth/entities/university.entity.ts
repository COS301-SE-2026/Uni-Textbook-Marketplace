import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm';

@Entity('universities')
export class University {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  email_domain!: string;
}