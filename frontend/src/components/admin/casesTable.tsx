'use client'

import { Badge } from '../ui';
import { AlertCircle, CheckCircle, Clock, User, Calendar, MessageSquare } from 'lucide-react';

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

interface CasesTableProps {
    cases: AdminCase[]
    loading?: boolean
    actionLoading: string | null
    onReview: (caseId: string) => void
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-ZA', {
        timeZone: 'Africa/Johannesburg',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

// ✅ FIX: Return the Badge with proper props (no className)
function getStatusBadge(status: string) {
    const variants: Record<string, { variant: 'approved' | 'pending' | 'rejected' | 'sold'; icon: React.ReactNode }> = {
        pending: {
            variant: 'pending',
            icon: <Clock size={12} className="mr-1 inline" />
        },
        upheld: {
            variant: 'rejected',
            icon: <AlertCircle size={12} className="mr-1 inline" />
        },
        reversed: {
            variant: 'approved',
            icon: <CheckCircle size={12} className="mr-1 inline" />
        },
    }

    const config = variants[status] || variants.pending

    // ✅ Wrap the Badge in a span with flex styling instead of using className on Badge
    return (
        <span className="inline-flex items-center gap-1">
            <Badge variant={config.variant}>
                {config.icon}
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        </span>
    )
}

function LoadingSkeleton() {
    return (
        <div className="space-y-2 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg" />
            ))}
        </div>
    )
}

export default function CasesTable({ cases, loading, actionLoading, onReview }: CasesTableProps) {
    if (loading) {
        return <LoadingSkeleton />
    }

    if (cases.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <MessageSquare size={40} className="mb-3 opacity-30" />
                <p className="text-sm font-medium">No cases found</p>
                <p className="text-xs mt-1">All appeals have been reviewed</p>
            </div>
        )
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/80">
                        <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                            User
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Appeal
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Status
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Submitted
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {cases.map((caseItem) => (
                        <tr key={caseItem.id} className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors duration-150">
                            {/* User Column */}
                            <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#00B4D8]/10 flex items-center justify-center">
                                        <User size={14} className="text-[#00B4D8]" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">
                                            {caseItem.user.first_name} {caseItem.user.last_name}
                                        </p>
                                        <p className="text-xs text-gray-400 truncate max-w-[150px]">
                                            {caseItem.user.email}
                                        </p>
                                    </div>
                                </div>
                            </td>

                            {/* Appeal Column */}
                            <td className="py-3 px-4">
                                <p className="text-sm text-gray-600 line-clamp-2 max-w-xs">
                                    {caseItem.appeal_message || 'No message provided'}
                                </p>
                                {caseItem.user.ban_reason && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        <span className="font-medium">Ban reason:</span> {caseItem.user.ban_reason}
                                    </p>
                                )}
                            </td>

                            {/* Status Column */}
                            <td className="py-3 px-4">
                                {getStatusBadge(caseItem.status)}
                            </td>

                            {/* Submitted Column */}
                            <td className="py-3 px-4 text-gray-500 text-xs">
                                <div className="flex items-center gap-1">
                                    <Calendar size={12} />
                                    {formatDate(caseItem.created_at)}
                                </div>
                            </td>

                            {/* Actions Column */}
                            <td className="py-3 px-4">
                                {caseItem.status === 'pending' ? (
                                    <button
                                        onClick={() => onReview(caseItem.id)}
                                        disabled={!!actionLoading}
                                        className="px-3 py-1.5 text-xs font-medium text-white bg-[#00B4D8] rounded-lg hover:bg-[#0098b8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {actionLoading === caseItem.id ? (
                                            <span className="flex items-center gap-1">
                                                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Reviewing...
                                            </span>
                                        ) : (
                                            'Review'
                                        )}
                                    </button>
                                ) : (
                                    <span className="text-xs text-gray-400">
                                        Reviewed {caseItem.reviewed_at ? formatDate(caseItem.reviewed_at) : ''}
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}