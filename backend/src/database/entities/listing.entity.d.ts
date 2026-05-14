import { User } from './users.entity';
import { Book } from './book.entity';
import { Module } from './module.entity';
export declare enum ListingStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    SOFT_DELETED = "SOFT_DELETED"
}
export declare class Listing {
    id: string;
    title: string;
    seller: User;
    book: Book;
    module: Module;
    condition: string;
    annotation_level: string;
    price: number;
    reviewer: User;
    reviewed_at: Date;
    photo_urls: string[];
    status: ListingStatus;
    has_notes: boolean;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
}
