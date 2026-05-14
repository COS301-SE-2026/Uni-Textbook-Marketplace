import { University } from './university.entity';
import { Listing } from './listing.entity';
export declare class User {
    id: string;
    email: string;
    password_hash: string;
    first_name: string;
    last_name: string;
    faculty: string;
    is_verified: boolean;
    role: string;
    university: University;
    listings: Listing[];
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
}
