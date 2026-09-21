import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Listing } from './listing.entity';
import { User } from './users.entity';

export enum AuctionStatus {
    SCHEDULED = 'SCHEDULED',
    ACTIVE = 'ACTIVE',
    ENDED = 'ENDED',
    CANCELLED = 'CANCELLED',
}

@Entity('auction')
@Index('idx_auction_status_endtime', ['status', 'end_time'])
export class Auction {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({
        type: 'uuid',
        nullable: true
    })
    listing_id: string | null;

    @ManyToOne(() => Listing, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'listing_id' })
    listing!: Listing | null;

    @Column({
        type: 'uuid',
        nullable: true
    })
    seller_id: string | null;

    @ManyToOne(() => User, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'seller_id' })
    seller!: User | null;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: false,
    })
    starting_price!: number;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true,
    })
    reserve_price!: number | null;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true,
    })
    current_highest_bid!: number | null;

    @Column({
        type: 'uuid',
        nullable: true
    })
    current_highest_bidder_id: string | null;

    @ManyToOne(() => User, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'current_highest_bidder_id' })
    current_highest_bidder!: User | null;

    @Column({
        type: 'timestamptz',
        nullable: true,
    })
    start_time!: Date | null;

    @Column({
        type: 'timestamptz',
        nullable: true,
    })
    end_time!: Date | null;

    @Column({
        type: 'enum',
        enum: AuctionStatus,
        default: AuctionStatus.SCHEDULED,
    })
    status!: AuctionStatus;

    @Column({
        type: 'int',
        default: 0,
        nullable: false,
    })
    extension_count!: number;

    @CreateDateColumn({
        type: 'timestamptz',
        nullable: false,
    })
    created_at!: Date;
}
