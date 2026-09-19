import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Auction } from './auction.entity';
import { User } from './users.entity';

export enum BidStatus {
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
}

@Entity('bid')
@Index('idx_bid_auction_id', ['auction'])
export class Bid {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Auction, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'auction_id' })
    auction!: Auction | null;

    @ManyToOne(() => User, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'bidder_id' })
    bidder!: User | null;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: false,
    })
    amount!: number;

    @CreateDateColumn({
        type: 'timestamptz',
        nullable: false,
    })
    placed_at!: Date;

    @Column({
        type: 'enum',
        enum: BidStatus,
        nullable: false,
    })
    status!: BidStatus;

    @Column({
        type: 'text',
        nullable: true,
    })
    rejection_reason!: string | null;
}