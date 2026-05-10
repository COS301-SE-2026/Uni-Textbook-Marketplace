import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";

@Entity('otps')
export class Otp{

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({type: 'varchar'})
    email!: string;

    @Column({type: 'char' ,length: 6})
    code!: string;

    @Column({type: 'timestamptz'})
    expires_at!: Date;

    @Column({default: false})
    used!: boolean;

    @CreateDateColumn({type: 'timestamptz'})
    created_at!: Date;

    @Column({default: 0})
    attempts!: number;
}