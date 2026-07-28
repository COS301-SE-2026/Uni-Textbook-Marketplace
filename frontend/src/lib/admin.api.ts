import { api } from './api';
import { buildQuery } from './api';
import { AuditLogEntry } from '@/components/admin/auditlogTable';

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

export interface LogFilter {

    performedBy?: string
    action?: string
    entityType?: string
    entity?: string
    entityid?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
}

interface AuditLogResponse {

    logs: AuditLogEntry[]
    total: number
    page: number
    limit: number
    totalPages: number
}

export interface AdminsEmail {
    id: string
    email: string
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

export async function getAuditLog(filters: LogFilter) {
    
    return api.get<AuditLogResponse>(`/admin/audit-log?${buildQuery(filters)}`)
}

export async function getadmin(){
    return api.get<AdminsEmail[]>('/admin/emails');
}