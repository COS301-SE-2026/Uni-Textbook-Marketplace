import { api } from './api';

export interface AdminListing {
    id: string
    title: string | null
    price: number
    condition: string
    annotation_level: string
    photo_urls: string[]
    created_at: string
    status: string
    book: {
        id: string
        title: string
        author: string
        edition: number
        isbn: string
        publisher: string
    }
    module: {
        id: string
        code: string
        name: string
        faculty: string
    } | null
    seller: {
        id: string
        email: string
        first_name: string
        last_name: string
    }
    reviewer?: { id: string} | null
}

export async function approveListing(id: string): Promise<void> {
    return api.patch(`/admin/${id}/approve`)
}

export async function rejectListing(id: string, reason: string): Promise<void> {
    return api.patch(`/admin/${id}/reject`, { reason })
}

export async function getAllAdminListings(): Promise<AdminListing[]>{
    return api.get<AdminListing[]>('/listings/admin/all');
}