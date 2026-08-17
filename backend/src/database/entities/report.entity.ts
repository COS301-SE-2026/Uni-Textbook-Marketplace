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
import { ReportCategory } from '../../reports/enums/report-category.dto';

@Entity('reports')
export class Report {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => User, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @ManyToOne(() => Listing, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'listing_id' })
    listing!: Listing;

    @Column({
        type: 'enum',
        enum: ReportCategory,
    })
    category!: ReportCategory;

    @Column({
        type: 'text',
    })
    reason!: string;

    @CreateDateColumn({
        type: 'timestamptz',
    })
    created_at!: Date;
}