import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from 'typeorm';

import { User } from './users.entity';
import { Listing } from './listing.entity';

export enum ReportStatus {
    PENDING = 'PENDING',
    REVIEWED = 'REVIEWED',
}

@Entity('reports')
export class Report {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => User, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'reporter_id' })
    reporter!: User;

    @ManyToOne(() => Listing, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'listing_id' })
    listing!: Listing;

    @Column({
        type: 'text',
    })
    reason!: string;

    @Column({
        type: 'enum',
        enum: ReportStatus,
        default: ReportStatus.PENDING,
    })
    status!: ReportStatus;

    @CreateDateColumn({
        type: 'timestamptz',
    })
    created_at!: Date;
}