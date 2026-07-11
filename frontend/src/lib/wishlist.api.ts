import { api } from './api';

export interface WishlistItem {
    id?: string;
    listingId?: string;
    listings_id?: string;
}

export async function save(listingId:string): Promise<void> {
    return api.post<void>(`/wishlist/${listingId}`);
}

export async function remove(listingId: string): Promise<void> {
    return api.delete<void>(`/wishlist/${listingId}`);
}

export async function mylist(): Promise<WishlistItem[]> {
    return api.get<WishlistItem[]>('/wishlist/mine')
}