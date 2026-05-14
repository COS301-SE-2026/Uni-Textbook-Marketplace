import { User } from './users.entity';
import { Module } from './module.entity';
export declare class University {
    id: string;
    name: string;
    email_domain: string;
    users: User[];
    modules: Module[];
}
