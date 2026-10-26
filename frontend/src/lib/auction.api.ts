import { api, buildQuery } from './api';
import type { Listing } from '@/components/listings/listingCard';

export interface CreateAuction {
    listing_id: string;
    starting_price: number;
    reserve_price?: number;
    start_time?: string;
    end_time: string;
}

export interface Auction {
    id: string;
    listing_id: string | null;
    seller_id: string | null;
    starting_price: number;
    reserve_price: number | null;
    current_highest_bid: number | null;
    current_highest_bidder_id: string | null;
    start_time: string | null;
    end_time: string | null;
    status: 'SCHEDULED' | 'ACTIVE' | 'ENDED' | 'CANCELLED';
    extension_count: number;
    created_at: string;
    bidCount?: number;
    listing?: Partial<Listing> | null;
}

export interface CreateAuctionResponse {
    message: string;
}

export interface PlaceBid {
    amount: number;
}

export type PlaceBidResponse =
    | { status: 'ACCEPTED'; auction: Auction }
    | { status: 'REJECTED'; reason: string };

export interface Bid {
    id: string;
    auction_id: string | null;
    bidder_id: string | null;
    amount: number;
    placed_at: string;
    status: 'ACCEPTED' | 'REJECTED';
    rejection_reason: string | null;
    bidder: Record<string, unknown> | null;
}

export interface BidHistoryResponse {
    data: Bid[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export async function createAuction(data: CreateAuction): Promise<CreateAuctionResponse> {
    return api.post<CreateAuctionResponse>('/auction', data);
}

export async function placeBid(auctionId: string, data: PlaceBid): Promise<PlaceBidResponse> {
    return api.post<PlaceBidResponse>(`/auction/${auctionId}/bid`, data);
}

export async function getAuctions(): Promise<Auction[]> {
    return api.get<Auction[]>('/auction');
}

export async function getAuctionForListing(listingId: string): Promise<Auction | null> {
    return api.get<Auction | null>(`/auction/listing/${listingId}`);
}

export async function getAuction(auctionId: string): Promise<Auction> {
    return api.get<Auction>(`/auction/${auctionId}`);
}

export async function getBidHistory(auctionId: string, page = 1, limit = 20): Promise<BidHistoryResponse> {
    const query = buildQuery({ page, limit });
    return api.get<BidHistoryResponse>(`/auction/${auctionId}/bids?${query}`);
}