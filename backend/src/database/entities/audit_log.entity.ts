import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
  Check,
} from 'typeorm';

import { User } from './users.entity';

@Entity('audit_log')
@Index('idx_audit_entity', ['entity_type', 'entity_id'])
@Index('idx_audit_created_at', ['performed_at'])
@Check(
  `action IN ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'SOLD', 'WITHDRAWN','APPROVE_LISTING','REJECT_LISTING')`,
)
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
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'performed_by' })
  performedBy: User;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  performed_at!: Date;

  @Column({
    type: 'text',
    nullable: true,
  })
  notes!: string;

  @Column({ type: 'text', nullable: true })
  reason?: string;
}
