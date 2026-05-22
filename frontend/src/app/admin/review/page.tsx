'use client'

import { useCallback, useEffect, useState } from 'react'
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

import { normalizeImage } from '@/lib/image'


type FilterTab = 'PENDING' | 'APPROVED' | 'REJECTED' | null

interface Toast {
    id: string
    message: string
    type: 'success' | 'error'
}

interface StatConfig {
    label: string
    value: number
    color: string
    filter: FilterTab
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

const TABLE_HEADERS = ['Book', 'Module', 'Status', 'Price', 'Seller', 'Date', 'Actions']


function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-ZA', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

function getFacultyLabel(faculty: string): string {
    return FACULTY_LABEL[faculty] ?? faculty
}

function getStatusBadgeVariant(status: string): 'approved' | 'rejected' {
    return status === 'APPROVED' ? 'approved' : 'rejected'
}


function BookCell({ listing }: Readonly<{ listing: AdminListing }>) {
    return (
        <td className="px-4 py-3">
            <div className="flex items-center gap-3">
                <div className="relative w-10 h-12 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                    {listing.photo_urls?.[0] ? (
                        <Image src={normalizeImage(listing.photo_urls[0])} alt="" fill className="object-cover" />
                    ) : (
                        <span className="text-gray-300">📷</span>
                    )}
                </div>
                <div>
                    <p className="font-medium line-clamp-1 max-w-[180px]">{listing.book.title}</p>
                    <p className="text-xs text-gray-400">
                        {listing.book.edition} Ed · ISBN {listing.book.isbn}
                    </p>
                </div>
            </div>
        </td>
    )
}

function ModuleCell({ module }: Readonly<{ module: AdminListing['module'] }>) {
    if (!module) {
        return <td className="px-4 py-3"><span className="text-xs text-gray-400">—</span></td>
    }
    return (
        <td className="px-4 py-3">
            <p className="font-mono text-xs">{module.code}</p>
            <p className="text-xs text-gray-400">{getFacultyLabel(module.faculty)}</p>
        </td>
    )
}

function ActionsCell({
    listing,
    actionLoading,
    onApprove,
    onStartReject,
}: Readonly<{
    listing: AdminListing
    actionLoading: string | null
    onApprove: (id: string) => void
    onStartReject: (id: string) => void
}>) {
    const isLoading = actionLoading === listing.id

    if (listing.status !== 'PENDING') {
        return (
            <td className="px-4 py-3">
                <Badge variant={getStatusBadgeVariant(listing.status)}><span>{listing.status}</span></Badge>
            </td>
        )
    }

    return (
        <td className="px-4 py-3">
            <div className="flex gap-2">
                <Button variant="primary" onClick={() => onApprove(listing.id)} disabled={isLoading}>
                    {isLoading ? '...' : 'Approve'}
                </Button>
                <Button variant="danger" onClick={() => onStartReject(listing.id)} disabled={isLoading}>
                    Reject
                </Button>
            </div>
        </td>
    )
}

function RejectionRow({
    listingId,
    reason,
    setReason,
    onConfirm,
    onCancel,
    loading,
}: {
    listingId: string
    reason: string
    setReason: (r: string) => void
    onConfirm: (id: string) => void
    onCancel: () => void
    loading: boolean
}) {
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
                    <button onClick={onCancel} className="text-xs text-gray-500 hover:text-gray-700">
                        Cancel
                    </button>
                </div>
            </td>
        </tr>
    )
}

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
}: {
    listing: AdminListing
    actionLoading: string | null
    onApprove: (id: string) => void
    onStartReject: (id: string) => void
    isRejectOpen: boolean
    rejectionReason: string
    setRejectionReason: (r: string) => void
    onConfirmReject: (id: string) => void
    onCancelReject: () => void
}) {
    return (
        <>
            <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <BookCell listing={listing} />
                <ModuleCell module={listing.module} />
                <td className="px-4 py-3">
                    <Badge variant={getStatusBadgeVariant(listing.status)}><span>{listing.status}</span></Badge>
                </td>
                <td className="px-4 py-3 font-semibold">R{listing.price}</td>
                <td className="px-4 py-3">
                    <p className="font-medium">{listing.seller.first_name} {listing.seller.last_name}</p>
                    <p className="text-xs text-gray-400">{listing.seller.email}</p>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(listing.created_at)}</td>
                <ActionsCell
                    listing={listing}
                    actionLoading={actionLoading}
                    onApprove={onApprove}
                    onStartReject={onStartReject}
                />
            </tr>
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

function ToastList({ toasts }: { toasts: Toast[] }) {
    return (
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
    )
}

function StatCard({
    stat,
    isActive,
    onClick,
}: {
    stat: StatConfig
    isActive: boolean
    onClick: () => void
}) {
    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onClick() }}
            className={`cursor-pointer transition ${isActive ? 'ring-2 ring-offset-2' : ''}`}
        >
            <Card>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
            </Card>
        </div>
    )
}

function ListingsTable({
    listings,
    actionLoading,
    rejectionTarget,
    rejectionReason,
    setRejectionReason,
    onApprove,
    onStartReject,
    onConfirmReject,
    onCancelReject,
}: {
    listings: AdminListing[]
    actionLoading: string | null
    rejectionTarget: string | null
    rejectionReason: string
    setRejectionReason: (r: string) => void
    onApprove: (id: string) => void
    onStartReject: (id: string) => void
    onConfirmReject: (id: string) => void
    onCancelReject: () => void
}) {
    return (
        <div className="card overflow-x-auto p-0">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-50">
                        {TABLE_HEADERS.map(h => (
                            <th key={h} className="text-left px-4 py-3 text-xs uppercase text-gray-500">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {listings.map(listing => (
                        <ListingRow
                            key={listing.id}
                            listing={listing}
                            actionLoading={actionLoading}
                            onApprove={onApprove}
                            onStartReject={onStartReject}
                            isRejectOpen={rejectionTarget === listing.id}
                            rejectionReason={rejectionReason}
                            setRejectionReason={setRejectionReason}
                            onConfirmReject={onConfirmReject}
                            onCancelReject={onCancelReject}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    )
}

function LoadingSkeleton() {
    return (
        <div className="card p-4 space-y-3 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded" />
            ))}
        </div>
    )
}


function useToasts() {
    const [toasts, setToasts] = useState<Toast[]>([])

    const showToast = useCallback((message: string, type: Toast['type']) => {
        const id = crypto.randomUUID()
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
    }, [])

    return { toasts, showToast }
}

function useListings(showToast: (msg: string, type: Toast['type']) => void) {
    const [listings, setListings] = useState<AdminListing[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [approvedCount, setApprovedCount] = useState(0)
    const [rejectedCount, setRejectedCount] = useState(0)

    useEffect(() => {
        getPendingListings()
            .then(data => {
                setListings(data ?? [])
                setLoading(false)
            })
            .catch(() => {
                showToast('Failed to load listings', 'error')
                setLoading(false)
            })
    }, [showToast])

    const updateListingStatus = (id: string, status: string) => {
        setListings(prev => prev.map(l => l.id === id ? { ...l, status } : l))
    }

    const handleApprove = async (id: string) => {
        setActionLoading(id)
        try {
            await approveListing(id)
            updateListingStatus(id, 'APPROVED')
            setApprovedCount(c => c + 1)
            showToast('Listing approved', 'success')
        } catch {
            showToast('Failed to approve listing', 'error')
        } finally {
            setActionLoading(null)
        }
    }

    const handleReject = async (id: string, reason: string) => {
        setActionLoading(id)
        try {
            await rejectListing(id, reason)
            updateListingStatus(id, 'REJECTED')
            setRejectedCount(c => c + 1)
            showToast('Listing rejected', 'success')
        } catch {
            showToast('Failed to reject listing', 'error')
        } finally {
            setActionLoading(null)
        }
    }

    return {
        listings,
        loading,
        actionLoading,
        approvedCount,
        rejectedCount,
        handleApprove,
        handleReject,
    }
}

function useRejection(onReject: (id: string, reason: string) => Promise<void>) {
    const [rejectionTarget, setRejectionTarget] = useState<string | null>(null)
    const [rejectionReason, setRejectionReason] = useState('')

    const startReject = (id: string) => {
        setRejectionTarget(id)
        setRejectionReason('')
    }

    const cancelReject = () => {
        setRejectionTarget(null)
        setRejectionReason('')
    }

    const confirmReject = async (id: string) => {
        if (!rejectionReason.trim()) return
        await onReject(id, rejectionReason)
        cancelReject()
    }

    return { rejectionTarget, rejectionReason, setRejectionReason, startReject, cancelReject, confirmReject }
}


export default function AdminReviewDashboard() {
    const [activeFilter, setActiveFilter] = useState<FilterTab>(null)

    const { toasts, showToast } = useToasts()
    const { listings, loading, actionLoading, approvedCount, rejectedCount, handleApprove, handleReject } =
        useListings(showToast)
    const { rejectionTarget, rejectionReason, setRejectionReason, startReject, cancelReject, confirmReject } =
        useRejection(handleReject)

    const pendingCount = listings.filter(l => l.status === 'PENDING').length
    const filtered = listings.filter(l => l.status === (activeFilter ?? 'PENDING'))

    const stats: StatConfig[] = [
        { label: 'Pending Review', value: pendingCount, color: 'text-amber-600', filter: 'PENDING' },
        { label: 'Approved', value: approvedCount, color: 'text-green-600', filter: 'APPROVED' },
        { label: 'Rejected', value: rejectedCount, color: 'text-red-600', filter: 'REJECTED' },
    ]

    const toggleFilter = (filter: FilterTab) =>
        setActiveFilter(prev => prev === filter ? null : filter)

    return (
        <AdminRoute>
            <div className="container-content py-8">
                <ToastList toasts={toasts} />

                <h1 className="text-xl font-semibold">Admin Review Dashboard</h1>

                <div className="grid grid-cols-3 gap-4 my-4">
                    {stats.map(stat => (
                        <StatCard
                            key={stat.label}
                            stat={stat}
                            isActive={activeFilter === stat.filter}
                            onClick={() => toggleFilter(stat.filter)}
                        />
                    ))}
                </div>

                {loading ? (
                    <LoadingSkeleton />
                ) : (
                    <ListingsTable
                        listings={filtered}
                        actionLoading={actionLoading}
                        rejectionTarget={rejectionTarget}
                        rejectionReason={rejectionReason}
                        setRejectionReason={setRejectionReason}
                        onApprove={handleApprove}
                        onStartReject={startReject}
                        onConfirmReject={confirmReject}
                        onCancelReject={cancelReject}
                    />
                )}
            </div>
        </AdminRoute>
    )
}