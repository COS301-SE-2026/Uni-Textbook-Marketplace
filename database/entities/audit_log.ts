import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn
} from 'typeorm';

import { User } from './user.entity';

@Entity('audit_log')
export class AuditLog {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  entity_type!: string;

  @Column('uuid')
  entity_id!: string;

  @Column()
  action!: string;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL'
  })
  @JoinColumn({ name: 'performed_by' })
  performedBy: User;

  @CreateDateColumn({
    type: 'timestamptz'
  })
  performed_at!: Date;

  @Column({
    type: 'text',
    nullable: true
  })
  notes!: string;
}