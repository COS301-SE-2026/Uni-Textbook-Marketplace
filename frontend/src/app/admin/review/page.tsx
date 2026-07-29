'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import AdminRoute from '@/components/auth/AdminRoute'
import {
    approveListing,
    rejectListing,
    AdminListing,
    getAllAdminListings,
} from '@/lib/admin.api'

import { normalizeImage } from '@/lib/image'
import FiltersTabs from '@/components/admin/filtersTabs'
import { useRouter } from 'next/navigation'
import { getMe } from '@/lib/auth.api'


interface Toast {
    id: string
    message: string
    type: 'success' | 'error'
}

const TABLE_HEADERS = ['Book', 'Module', 'Price', 'Seller', 'Date', 'Actions']

type FilterValue = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-ZA', {
        timeZone: 'Africa/Johannesburg',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
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
        </td>
    )
}

function ActionsCell({
    listing,
    actionLoading,
    onApprove,
    onStartReject,
    onViewDetails,
}: Readonly<{
    listing: AdminListing
    actionLoading: string | null
    onApprove: (id: string) => void
    onStartReject: (id: string) => void
    onViewDetails: (id: string) => void
}>) {
    const isLoading = actionLoading === listing.id

    return (
        <td className="px-4 py-3">
            <div className="flex gap-2">
                <Button variant="secondary" onClick={() => onViewDetails(listing.id)} disabled={isLoading}>
                    {isLoading ? '...' : 'View'}
                </Button>
                {listing.status === 'PENDING' && (
                    <>
                        <Button variant="primary" onClick={() => onApprove(listing.id)} disabled={isLoading}>
                            {isLoading ? '...' : 'Approve'}
                        </Button>
                        <Button variant="danger" onClick={() => onStartReject(listing.id)} disabled={isLoading}>
                            Reject
                        </Button>
                    </>
                )}
            </div>
        </td>
    )
}


function ListingRow({
    listing,
    actionLoading,
    onApprove,
    onStartReject,
    onViewDetails,
}: {
    listing: AdminListing
    actionLoading: string | null
    onApprove: (id: string) => void
    onStartReject: (id: string) => void
    onViewDetails: (id: string) => void
}) {
    return (

        <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
            <BookCell listing={listing} />
            <ModuleCell module={listing.module} />
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
                onViewDetails={onViewDetails}
            />
        </tr>

    )
}

function ToastList({ toasts }: { toasts: Toast[] }) {
    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
            {toasts.map(t => (
                <div
                    key={t.id}
                    className={`px-4 py-2 rounded text-white text-sm animate in slide-in-from-right-5 ${t.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
                >
                    {t.message}
                </div>
            ))}
        </div>
    )
}

function ListingsTable({
    listings,
    actionLoading,
    onApprove,
    onStartReject,
    onViewDetails,
}: {
    listings: AdminListing[]
    actionLoading: string | null
    onApprove: (id: string) => void
    onStartReject: (id: string) => void
    onViewDetails: (id: string) => void
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
                            onViewDetails={onViewDetails}
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

function RejectionModal({
    listing,
    reason,
    setReason,
    onConfirm,
    onCancel,
    loading,
}: {
    listing: AdminListing | undefined
    reason: string
    setReason: (r: string) => void
    onConfirm: () => void
    onCancel: () => void
    loading: boolean
}) {
    return (
        <Modal
            isOpen={!!listing}
            onClose={onCancel}
            title={`Reject "${listing?.title ?? 'listing'}"`}
        >
            <div className='flex flex-col gap-4'>
                <p className='text-sm text-gray-600'>
                    Let the seller know why this listing doesn&apos;t meet the requirements
                </p>

                <textarea
                    className="w-full border border-gray-300 rounded p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Enter reject reason..."
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    autoFocus
                />

                <div className='flex justify-end gap-2'>
                    <Button variant='secondary' onClick={onCancel}>
                        Cancel
                    </Button>

                    <Button variant='danger' onClick={onConfirm} disabled={!reason.trim() || loading}>
                        {loading ? 'Rejecting...' : 'Confirm Reject'}
                    </Button>
                </div>

            </div>
        </Modal>
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

function useListings(showToast: (msg: string, type: Toast['type']) => void, currentAdminId: string | null) {
    const [listings, setListings] = useState<AdminListing[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    useEffect(() => {
        getAllAdminListings()
            .then(data => {
                setListings(data ?? [])
                setLoading(false)
            })
            .catch(() => {
                showToast('Failed to load listings', 'error')
                setLoading(false)
            })
    }, [showToast])

    const updateListingStatus = (id: string, status: string, reviewerId: string | null) => {
        setListings(prev => prev.map(l =>
            l.id === id ? { ...l, status, reviewer: reviewerId ? { id: reviewerId } : l.reviewer } : l
        ))
    }

    const handleApprove = async (id: string) => {
        setActionLoading(id)
        try {
            await approveListing(id)
            updateListingStatus(id, 'APPROVED',currentAdminId)
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
            updateListingStatus(id, 'REJECTED',currentAdminId)
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

    const confirmReject = async () => {
        if (!rejectionTarget || !rejectionReason.trim()) return
        await onReject(rejectionTarget, rejectionReason)
        cancelReject()
    }

    return { rejectionTarget, rejectionReason, setRejectionReason, startReject, cancelReject, confirmReject }
}


export default function AdminReviewDashboard() {
    const router = useRouter()
    const { toasts, showToast } = useToasts()
    const [currentAdminId, setCurrentAdminId] = useState<string | null>(null)
    const { listings, loading, actionLoading, handleApprove, handleReject } = useListings(showToast,currentAdminId)
    const { rejectionTarget, rejectionReason, setRejectionReason, startReject, cancelReject, confirmReject } = useRejection(handleReject)
    

    useEffect(() => {
        getMe()
            .then(user => setCurrentAdminId(user.id))
            .catch(() => showToast('failed to load user','error'))
    },[showToast])

    const pendingCount = listings.filter(l => l.status === 'PENDING').length
    const approveByMeCount = listings.filter(l => l.status === 'APPROVED' && l.reviewer?.id === currentAdminId).length
    const rejectedByMeCount = listings.filter(l => l.status === 'REJECTED' && l.reviewer?.id === currentAdminId).length

    const [activeFilter, setActiveFilter] = useState<FilterValue>('PENDING')
    const counts: Record<FilterValue, number> = {
        ALL: listings.length,
        PENDING: pendingCount,
        APPROVED: approveByMeCount,
        REJECTED: rejectedByMeCount,
    }

    const filtered = activeFilter === 'ALL'
        ? listings
        : activeFilter === 'APPROVED'
        ? listings.filter(l => l.status === 'APPROVED' && l.reviewer?.id === currentAdminId)
        : activeFilter === 'REJECTED'
        ? listings.filter(l => l.status === 'REJECTED' && l.reviewer?.id === currentAdminId)
        : listings.filter(l => l.status === activeFilter)

    const rejectionListing = listings.find(li => li.id === rejectionTarget)

    const handleViewDetails = (id: string) => {
        router.push(`/listings/${id}`)
    }


    return (
        <AdminRoute>
            <div className="container-content py-8">
                <ToastList toasts={toasts} />

                <h1 className="text-xl font-semibold">Admin Review Dashboard</h1>

                <FiltersTabs activeFilter={activeFilter} counts={counts} onChange={setActiveFilter} />

                {loading ? (
                    <LoadingSkeleton />
                ) : (
                    <ListingsTable
                        listings={filtered}
                        actionLoading={actionLoading}
                        onApprove={handleApprove}
                        onStartReject={startReject}
                        onViewDetails={handleViewDetails}
                    />
                )}

                <RejectionModal
                    listing={rejectionListing}
                    reason={rejectionReason}
                    setReason={setRejectionReason}
                    onConfirm={confirmReject}
                    onCancel={cancelReject}
                    loading={actionLoading === rejectionTarget}
                />
            </div>
        </AdminRoute>
    )
}