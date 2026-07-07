import { Entity, JoinColumn, CreateDateColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./users.entity";
import { Listing } from "./listing.entity";

@Entity('wishlist')
export class Wishlist {

    @PrimaryColumn('uuid')
    user_id: string;

    @PrimaryColumn('uuid')
    listings_id: string;

    @ManyToOne(() => User, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'user_id'})
    user: User;

    @ManyToOne(() => Listing, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'listings_id'})
    listing: Listing;

    @CreateDateColumn({type: 'timestamptz'})
    created_at: Date;
}