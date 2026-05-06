import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm';

@Entity('users')
export class User{

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({
        type: 'varchar',
        length: 255,
        unique: true,
        nullable: false,
    })
    email!: string; 

    @Column({type: 'varchar', nullable: false})
    password_hash!: string;

    @Column({type: 'varchar', nullable: false})
    first_name!: string;

    @Column({type: 'varchar', nullable: false})
    last_name!: string;

    @Column({type: 'uuid', nullable: false})
    university_id!: string;

    @Column({type: 'varchar', length: 100, nullable: true})
    faculty!: string;

    @Column({type: 'boolean', default: false})
    is_verified!: boolean;

    @Column({type: 'varchar',length: 10, default: 'student'})
    role!: 'student' | 'admin';

    @Column({type: 'timestamptz', default: () => 'NOW()'})
    created_at!: Date;

    @Column({ type: 'timestamptz', nullable: true })
    updated_at!: Date;

    @Column({ type: 'timestamptz', nullable: true })
    deleted_at!: Date;
}
