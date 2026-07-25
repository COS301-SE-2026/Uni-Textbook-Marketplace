import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./users.entity";
import { Listing } from "./listing.entity";


@Entity('notifications')
export class Notifications {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, {nullable: false, onDelete: 'CASCADE'})
    @JoinColumn({name: 'user_id'})
    user_id: User;

    @ManyToOne(() => User, {nullable: true, onDelete: 'SET NULL'})
    @JoinColumn({name: 'notification_from'})
    notification_from: User

    @Column({type: "boolean", nullable: false, default: false})
    is_read: boolean;

    @Column({type: 'varchar', nullable: false})
    entity_type: string;

    @ManyToOne(() => Listing, {nullable: true, onDelete: 'SET NULL'})
    @JoinColumn({name: 'entity_id'})
    entity_id: Listing;

    @Column({type: 'text', nullable:false})
    message_info: string;

    @CreateDateColumn({type: 'timestamptz'})
    created_at: Date;
}