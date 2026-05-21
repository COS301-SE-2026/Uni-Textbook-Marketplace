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

/* -----------------------------
   Rejection Row (separated)
------------------------------ */
function RejectionRow({
    listingId,
    reason,
    setReason,
    onConfirm,
    onCancel,
    loading,
}: any) {
    return (
        <tr className="bg-red-50">
            <td colSpan={7} className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        placeholder="Enter rejection reason..."
                        className="flex-1 text-sm border rounded px-2 py-1"
                        autoFocus
                    />

                    <button
                        onClick={() => onConfirm(listingId)}
                        disabled={!reason.trim() || loading}
                        className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700 disabled:opacity-50 whitespace-nowrap"
                    >
                        Confirm Reject
                    </button>

                    <button
                        onClick={onCancel}
                        className="text-xs text-gray-500 hover:text-gray-700"
                    >
                        Cancel
                    </button>
                </div>
            </td>
        </tr>
    )
}

/* -----------------------------
   Listing Row (main fix)
------------------------------ */
function ListingRow({
    listing,
    actionLoading,
    onApprove,
    onStartReject,
    isRejectOpen,
    rejectionReason,
    setRejectionReason,
    onConfirmReject,
    onCancelReject,
}: any) {
    return (
        <>
            <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors">

                {/* Book */}
                <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                        <div className="relative w-10 h-12 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                            {listing.photo_urls?.[0] ? (
                                <Image
                                    src={listing.photo_urls[0]}
                                    alt=""
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <span className="text-gray-300">📷</span>
                            )}
                        </div>

                        <div>
                            <p className="font-medium line-clamp-1 max-w-[180px]">
                                {listing.book.title}
                            </p>
                            <p className="text-xs text-gray-400">
                                {listing.book.edition} Ed · ISBN {listing.book.isbn}
                            </p>
                        </div>
                    </div>
                </td>

                {/* Module */}
                <td className="px-4 py-3">
                    {listing.module ? (
                        <>
                            <p className="font-mono text-xs">{listing.module.code}</p>
                            <p className="text-xs text-gray-400">
                                {FACULTY_LABEL[listing.module.faculty] ?? listing.module.faculty}
                            </p>
                        </>
                    ) : (
                        <span className="text-xs text-gray-400">—</span>
                    )}
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                    <Badge variant={listing.status === 'APPROVED' ? 'approved' : 'rejected'}>
                        {listing.status}
                    </Badge>
                </td>

                {/* Price */}
                <td className="px-4 py-3 font-semibold">
                    R{listing.price}
                </td>

                {/* Seller */}
                <td className="px-4 py-3">
                    <p className="font-medium">
                        {listing.seller.first_name} {listing.seller.last_name}
                    </p>
                    <p className="text-xs text-gray-400">{listing.seller.email}</p>
                </td>

                {/* Submitted */}
                <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(listing.created_at).toLocaleDateString('en-ZA', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                    })}
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                    {listing.status === 'PENDING' ? (
                        <div className="flex gap-2">
                            <Button
                                variant="primary"
                                onClick={() => onApprove(listing.id)}
                                disabled={actionLoading === listing.id}
                            >
                                {actionLoading === listing.id ? '...' : 'Approve'}
                            </Button>

                            <Button
                                variant="danger"
                                onClick={() => onStartReject(listing.id)}
                                disabled={actionLoading === listing.id}
                            >
                                Reject
                            </Button>
                        </div>
                    ) : (
                        <Badge variant={listing.status === 'APPROVED' ? 'approved' : 'rejected'}>
                            {listing.status}
                        </Badge>
                    )}
                </td>
            </tr>

            {/* Rejection row */}
            {isRejectOpen && (
                <RejectionRow
                    listingId={listing.id}
                    reason={rejectionReason}
                    setReason={setRejectionReason}
                    onConfirm={onConfirmReject}
                    onCancel={onCancelReject}
                    loading={actionLoading === listing.id}
                />
            )}
        </>
    )
}

/* -----------------------------
   Main Page
------------------------------ */
export default function AdminReviewDashboard() {

    const [listings, setListings] = useState<AdminListing[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [rejectionTarget, setRejectionTarget] = useState<string | null>(null)
    const [rejectionReason, setRejectionReason] = useState('')
    const [toasts, setToasts] = useState<any[]>([])
    const [activeFilter, setActiveFilter] = useState<FilterTab>(null)

    const [approvedCount, setApprovedCount] = useState(0)
    const [rejectedCount, setRejectedCount] = useState(0)

    const showToast = (message: string, type: 'success' | 'error') => {
        const id = crypto.randomUUID()
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, 3000)
    }

    useEffect(() => {
        const fetchPending = async () => {
            setLoading(true)
            try {
                const data = await getPendingListings()
                setListings(data ?? [])
            } catch {
                showToast('Failed to load listings', 'error')
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
            setListings(prev =>
                prev.map(l => l.id === id ? { ...l, status: 'APPROVED' } : l)
            )
            setApprovedCount(c => c + 1)
            showToast('Listing approved', 'success')
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

            setListings(prev =>
                prev.map(l => l.id === id ? { ...l, status: 'REJECTED' } : l)
            )

            setRejectedCount(c => c + 1)
            setRejectionTarget(null)
            setRejectionReason('')
            showToast('Listing rejected', 'success')
        } catch {
            showToast('Failed to reject listing', 'error')
        } finally {
            setActionLoading(null)
        }
    }

    type ListingId = string

    const filtered = activeFilter
        ? listings.filter(l => l.status === activeFilter)
        : listings.filter(l => l.status === 'PENDING')

    const pendingCount = listings.filter(l => l.status === 'PENDING').length

    const stats = [
        { label: 'Pending Review', value: pendingCount, color: 'text-amber-600', filter: 'PENDING' as FilterTab },
        { label: 'Approved', value: approvedCount, color: 'text-green-600', filter: 'APPROVED' as FilterTab },
        { label: 'Rejected', value: rejectedCount, color: 'text-red-600', filter: 'REJECTED' as FilterTab },
    ]

    return (
        <AdminRoute>
            <div className="container-content py-8">

                {/* Toasts */}
                <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
                    {toasts.map(t => (
                        <div
                            key={t.id}
                            className={`px-4 py-2 rounded text-white text-sm ${t.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
                        >
                            {t.message}
                        </div>
                    ))}
                </div>

                {/* Header */}
                <h1 className="text-xl font-semibold">Admin Review Dashboard</h1>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 my-4">
                    {stats.map(s => (
                        <div
                            key={s.label}
                            onClick={() =>
                                setActiveFilter(prev =>
                                    prev === s.filter ? null : s.filter
                                )
                            }
                            className={`cursor-pointer transition ${activeFilter === s.filter ? 'ring-2 ring-offset-2' : ''}`}
                        >
                            <Card>
                                <p className={`text-2xl font-bold ${s.color}`}>
                                    {s.value}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {s.label}
                                </p>
                            </Card>
                        </div>
                    ))}
                </div>

                {/* Table */}
                {loading ? (
                    <div className="card p-4 space-y-3 animate-pulse">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-10 bg-gray-100 rounded" />
                        ))}
                    </div>
                ) : (
                    <div className="card overflow-x-auto p-0">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50">
                                    {['Book', 'Module', 'Status', 'Price', 'Seller', 'Date', 'Actions'].map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-xs uppercase text-gray-500">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {filtered.map(listing => (
                                    <ListingRow
                                        key={listing.id}
                                        listing={listing}
                                        actionLoading={actionLoading}
                                        onApprove={handleApprove}
                                        onStartReject={(id: ListingId) => {
                                            setRejectionTarget(id)
                                            setRejectionReason('')
                                        }}
                                        isRejectOpen={rejectionTarget === listing.id}
                                        rejectionReason={rejectionReason}
                                        setRejectionReason={setRejectionReason}
                                        onConfirmReject={handleReject}
                                        onCancelReject={() => {
                                            setRejectionTarget(null)
                                            setRejectionReason('')
                                        }}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminRoute>
    )
}