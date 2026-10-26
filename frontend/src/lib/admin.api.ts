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

export interface AdminCase {
    id: string
    user_id: string
    appeal_message: string | null
    status: 'pending' | 'upheld' | 'reversed'
    reviewed_by: string | null
    reviewed_at: string | null
    created_at: string
    updated_at: string | null
    deleted_at: string | null
    user: {
        id: string
        email: string
        first_name: string
        last_name: string
        is_banned: boolean
        banned_at: string | null
        ban_reason: string | null
    }
}

export interface PaginatedCasesResponse {
    data: AdminCase[]
    meta: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
}

export interface CaseFilter {
    page?: number
    limit?: number
    status?: string
    search?: string
}

export interface CaseDecisionDto {
    decision: 'upheld' | 'reversed'
    adminNotes?: string
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

export async function getAdminCases(filters: CaseFilter): Promise<PaginatedCasesResponse> {
    return api.get<PaginatedCasesResponse>(`/cases/admin?${buildQuery(filters)}`);
}

export async function getPendingCases(): Promise<AdminCase[]> {
    return api.get<AdminCase[]>('/cases/admin/pending');
}

export async function reviewCase(caseId: string, decision: 'upheld' | 'reversed', adminNotes?: string): Promise<AdminCase> {
    return api.patch<AdminCase>(`/cases/${caseId}/review`, { decision, adminNotes });
}

export async function getCaseById(caseId: string): Promise<AdminCase> {
    return api.get<AdminCase>(`/cases/${caseId}`);
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