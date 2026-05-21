'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import AdminRoute from '@/components/auth/AdminRoute'
import {
    getPendingListings,
    approveListing,
    rejectListing,
    AdminListing,
} from '@/lib/admin.api'

type FilterTab = 'PENDING' | 'APPROVED' | 'REJECTED' | null

interface Toast {
    id: string
    message: string
    type: 'success' | 'error'
}

const FACULTY_LABEL: Record<string, string> = {
    ENG: 'Engineering',
    EBIT: 'EBIT',
    LAW: 'Law',
    HUM: 'Humanities',
    MED: 'Health Sciences',
    NAT: 'Natural Sciences',
    ECO: 'Economic Sciences',
    EDU: 'Education',
}

export default function AdminReviewDashboard() {

    const [listings, setListings] = useState<AdminListing[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [rejectionTarget, setRejectionTarget] = useState<string | null>(null)
    const [rejectionReason, setRejectionReason] = useState('')
    const [toasts, setToasts] = useState<Toast[]>([])
    const [activeFilter, setActiveFilter] = useState<FilterTab>(null)

    // Counters tracked separately so they survive row removal
    const [approvedCount, setApprovedCount] = useState(0)
    const [rejectedCount, setRejectedCount] = useState(0)

    const showToast = (message: string, type: 'success' | 'error') => {
        const id = crypto.randomUUID()
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
    }

    useEffect(() => {
        const fetchPending = async () => {
            setLoading(true)
            try {
                const data = await getPendingListings()
                setListings(data ?? [])
            } catch {
                showToast('Failed to load pending listings', 'error')
            } finally {
                setLoading(false)
            }
        }
        fetchPending()
    }, [])

    const handleApprove = async (id: string) => {
        setActionLoading(id)
        try {
            await approveListing(id)
            setListings(prev => prev.map(l =>
                l.id === id ? { ...l, status: 'APPROVED' } : l
            ))
            setApprovedCount(c => c + 1)
            showToast('Listing approved successfully', 'success')
        } catch {
            showToast('Failed to approve listing', 'error')
        } finally {
            setActionLoading(null)
        }
    }

    const handleReject = async (id: string) => {
        if (!rejectionReason.trim()) return
        setActionLoading(id)
        try {
            await rejectListing(id, rejectionReason)
            setListings(prev => prev.map(l =>
                l.id === id ? { ...l, status: 'REJECTED' } : l
            ))
            setRejectedCount(c => c + 1)
            showToast('Listing rejected', 'success')
            setRejectionTarget(null)
            setRejectionReason('')
        } catch {
            showToast('Failed to reject listing', 'error')
        } finally {
            setActionLoading(null)
        }
    }

    // Filter logic
    const pendingCount = listings.filter(l => l.status === 'PENDING').length
    const filtered = activeFilter
        ? listings.filter(l => l.status === activeFilter)
        : listings.filter(l => l.status === 'PENDING') // default show pending

    const stats = [
        {
            label: 'Pending Review',
            value: pendingCount,
            color: 'text-amber-600',
            activeColor: 'ring-2 ring-amber-400',
            filter: 'PENDING' as FilterTab,
        },
        {
            label: 'Approved',
            value: approvedCount,
            color: 'text-green-600',
            activeColor: 'ring-2 ring-green-400',
            filter: 'APPROVED' as FilterTab,
        },
        {
            label: 'Rejected',
            value: rejectedCount,
            color: 'text-red-600',
            activeColor: 'ring-2 ring-red-400',
            filter: 'REJECTED' as FilterTab,
        },
    ]

    return (
        <AdminRoute>
            <div className="container-content py-8">

                {/* Toasts */}
                <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
                    {toasts.map(toast => (
                        <div
                            key={toast.id}
                            className={`px-4 py-3 rounded shadow-lg text-sm font-medium text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                                }`}
                        >
                            {toast.message}
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div className="mb-6">
                    <h1>Admin Review Dashboard</h1>
                    <p className="text-gray-500 text-sm">
                        Review and moderate pending listing submissions
                    </p>
                </div>

                {/* Filter cards */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                    {stats.map(stat => (
                        <div
                            key={stat.label}
                            onClick={() => setActiveFilter(
                                activeFilter === stat.filter ? null : stat.filter
                            )}
                            className={`cursor-pointer transition-all ${activeFilter === stat.filter ? stat.activeColor : ''
                                } rounded-lg`}
                        >
                            <Card className="text-center">
                                <p className={`text-3xl font-bold ${stat.color}`}>
                                    {stat.value}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {stat.label}
                                </p>
                            </Card>
                        </div>
                    ))}
                </div>

                {/* Active filter indicator + clear */}
                {activeFilter && (
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-gray-500">
                            Showing <span className="font-medium">{activeFilter.toLowerCase()}</span> listings
                        </p>
                        <Button
                            variant="secondary"
                            onClick={() => setActiveFilter(null)}
                        >
                            Clear Filter
                        </Button>
                    </div>
                )}

                {/* Table */}
                {loading ? (
                    <div className="card animate-pulse space-y-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-16 bg-gray-100 rounded" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="card flex flex-col items-center justify-center h-48 text-gray-400">
                        <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm">
                            {activeFilter
                                ? `No ${activeFilter.toLowerCase()} listings`
                                : 'All caught up — no pending listings!'}
                        </p>
                    </div>
                ) : (
                    <div className="card overflow-x-auto p-0">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    {['Book', 'Module', 'Condition', 'Price', 'Seller', 'Submitted', 'Actions'].map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(listing => (
                                    <>
                                        <tr key={listing.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">

                                            {/* Book */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative w-10 h-12 bg-gray-100 rounded flex-shrink-0 overflow-hidden flex items-center justify-center">
                                                        {listing.photo_urls?.[0] ? (
                                                            <Image src={listing.photo_urls[0]} alt="" fill className="object-cover" />
                                                        ) : (
                                                            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium line-clamp-1 max-w-[180px]">{listing.book.title}</p>
                                                        <p className="text-xs text-gray-400">{listing.book.edition} Ed · ISBN {listing.book.isbn}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Module */}
                                            <td className="px-4 py-3">
                                                {listing.module ? (
                                                    <>
                                                        <p className="font-mono text-xs">{listing.module.code}</p>
                                                        <p className="text-xs text-gray-400">{FACULTY_LABEL[listing.module.faculty] ?? listing.module.faculty}</p>
                                                    </>
                                                ) : (
                                                    <span className="text-xs text-gray-400">—</span>
                                                )}
                                            </td>

                                            {/* Condition */}
                                            <td className="px-4 py-3">
                                                <Badge variant={listing.status === 'APPROVED' ? 'approved' : 'rejected'}>
                                                    <span>{listing.status}</span>
                                                </Badge>
                                            </td>

                                            {/* Price */}
                                            <td className="px-4 py-3 font-semibold">R{listing.price}</td>

                                            {/* Seller */}
                                            <td className="px-4 py-3">
                                                <p className="font-medium">{listing.seller.first_name} {listing.seller.last_name}</p>
                                                <p className="text-xs text-gray-400">{listing.seller.email}</p>
                                            </td>

                                            {/* Submitted */}
                                            <td className="px-4 py-3 text-gray-500 text-xs">
                                                {new Date(listing.created_at).toLocaleDateString('en-ZA', {
                                                    day: '2-digit', month: 'short', year: 'numeric',
                                                })}
                                            </td>

                                            {/* Actions — only show for pending */}
                                            <td className="px-4 py-3">
                                                {listing.status === 'PENDING' ? (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="primary"
                                                            onClick={() => handleApprove(listing.id)}
                                                            disabled={actionLoading === listing.id}
                                                        >
                                                            {actionLoading === listing.id ? '...' : 'Approve'}
                                                        </Button>
                                                        <Button
                                                            variant="danger"
                                                            onClick={() => { setRejectionTarget(listing.id); setRejectionReason('') }}
                                                            disabled={actionLoading === listing.id}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Badge variant={listing.status === 'APPROVED' ? 'approved' : 'rejected'}>
                                                        <span>{listing.status}</span>
                                                    </Badge>
                                                )}
                                            </td>
                                        </tr>

                                        {/* Rejection reason row */}
                                        {rejectionTarget === listing.id && (
                                            <tr key={`${listing.id}-reject`} className="bg-red-50">
                                                <td colSpan={7} className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="text"
                                                            value={rejectionReason}
                                                            onChange={e => setRejectionReason(e.target.value)}
                                                            placeholder="Enter rejection reason..."
                                                            className="flex-1 text-sm border rounded px-2 py-1"
                                                            autoFocus
                                                        />
                                                        <button
                                                            onClick={() => handleReject(listing.id)}
                                                            disabled={!rejectionReason.trim() || actionLoading === listing.id}
                                                            className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700 disabled:opacity-50 whitespace-nowrap"
                                                        >
                                                            Confirm Reject
                                                        </button>
                                                        <button
                                                            onClick={() => { setRejectionTarget(null); setRejectionReason('') }}
                                                            className="text-xs text-gray-500 hover:text-gray-700"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

            </div>
        </AdminRoute>
    )
}