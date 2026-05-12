import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('otps')
export class OTP {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  email!: string;

  @Column({
    length: 6,
  })
  code!: string;

  @Column({
    type: 'timestamptz',
  })
  expires_at!: Date;

  @Column({
    default: false,
  })
  used!: boolean;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  created_at!: Date;

  @Column({ type: 'int', default: 0 })
  attempts!: number;
}
