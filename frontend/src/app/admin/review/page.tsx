'use client'

import { useEffect, useState } from 'react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface PendingListing {
    id: string
    title: string
    author: string
    edition: string
    isbn: string
    moduleCode: string
    faculty: string
    condition: string
    annotationLevel: string
    price: number
    description: string
    images: string[]
    createdAt: string
    seller: {
        id: string
        name: string
        email: string
        verified: boolean
    }
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

const CONDITION_LABEL: Record<string, string> = {
    LIKE_NEW: 'Like New',
    GOOD: 'Good',
    ACCEPTABLE: 'Acceptable',
}


export default function AdminReviewDashboard() {

    const [listings, setListings] = useState<PendingListing[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [rejectionTarget, setRejectionTarget] = useState<string | null>(null)
    const [rejectionReason, setRejectionReason] = useState('')
    const [feedback, setFeedback] = useState<
        { id: string; action: 'approved' | 'rejected' }[]
    >([])


    useEffect(() => {
        const fetchPending = async () => {
            setLoading(true)
            try {
                const res = await fetch('/api/admin/listings/pending')
                const data = await res.json()
                setListings(data.listings ?? [])
            } catch (err) {
                console.error('Failed to fetch pending listings', err)
            } finally {
                setLoading(false)
            }
        }
        fetchPending()
    }, [])



    const handleApprove = async (id: string) => {
        setActionLoading(id)
        try {
            await fetch(`/api/admin/listings/${id}/approve`, { method: 'PATCH' })
            setListings(prev => prev.filter(l => l.id !== id))
            setFeedback(prev => [...prev, { id, action: 'approved' }])
        } catch (err) {
            console.error('Approve failed', err)
        } finally {
            setActionLoading(null)
        }
    }

    const handleReject = async (id: string) => {
        if (!rejectionReason.trim()) return
        setActionLoading(id)
        try {
            await fetch(`/api/admin/listings/${id}/reject`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: rejectionReason }),
            })
            setListings(prev => prev.filter(l => l.id !== id))
            setFeedback(prev => [...prev, { id, action: 'rejected' }])
            setRejectionTarget(null)
            setRejectionReason('')
        } catch (err) {
            console.error('Reject failed', err)
        } finally {
            setActionLoading(null)
        }
    }

    return (
        <div className="container-content py-8">

            {/* Header */}
            <div className="mb-6">
                <h1>Admin Review Dashboard</h1>
                <p className="text-gray-500 text-sm">
                    Review and moderate pending listing submissions
                </p>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                    { label: 'Pending Review', value: listings.length, color: 'text-amber-600' },
                    { label: 'Approved Today', value: feedback.filter(f => f.action === 'approved').length, color: 'text-green-600' },
                    { label: 'Rejected Today', value: feedback.filter(f => f.action === 'rejected').length, color: 'text-red-600' },
                ].map(stat => (
                    <Card key={stat.label} className="text-center">
                        <p className={`text-3xl font-bold ${stat.color}`}>
                            {stat.value}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {stat.label}
                        </p>
                    </Card>
                ))}
            </div>

            {/* Table */}
            {loading ? (
                <div className="card animate-pulse space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-16 bg-gray-100 rounded" />
                    ))}
                </div>
            ) : listings.length === 0 ? (
                <div className="card flex flex-col items-center justify-center h-48 text-gray-400">
                    <svg
                        className="w-10 h-10 mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <p className="text-sm">All caught up — no pending listings!</p>
                </div>
            ) : (
                <div className="card overflow-x-auto p-0">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                {[
                                    'Book',
                                    'Module',
                                    'Condition',
                                    'Price',
                                    'Seller',
                                    'Submitted',
                                    'Actions',
                                ].map(h => (
                                    <th
                                        key={h}
                                        className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {listings.map(listing => (
                                <>
                                    <tr
                                        key={listing.id}
                                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                                    >
                                        {/* Book */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {/* Thumbnail */}
                                                <div className="w-10 h-12 bg-gray-100 rounded flex-shrink-0 overflow-hidden flex items-center justify-center">
                                                    {listing.images?.[0] ? (
                                                        <img
                                                            src={listing.images[0]}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <svg
                                                            className="w-5 h-5 text-gray-300"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={1}
                                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                            />
                                                        </svg>
                                                    )}
                                                </div>

                                                <div>
                                                    <p className="font-medium line-clamp-1 max-w-[180px]">
                                                        {listing.title}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {listing.edition} Ed · ISBN {listing.isbn}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Module */}
                                        <td className="px-4 py-3">
                                            <p className="font-mono text-xs">
                                                {listing.moduleCode}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {FACULTY_LABEL[listing.faculty] ?? listing.faculty}
                                            </p>
                                        </td>

                                        {/* Condition */}
                                        <td className="px-4 py-3">
                                            <Badge variant='approved'>
                                                <span>
                                                    {CONDITION_LABEL[listing.condition] ?? listing.condition}
                                                </span>
                                            </Badge>
                                        </td>

                                        {/* Price */}
                                        <td className="px-4 py-3 font-semibold">
                                            R{listing.price}
                                        </td>

                                        {/* Seller */}
                                        <td className="px-4 py-3">
                                            <p className="font-medium">
                                                {listing.seller.name}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {listing.seller.email}
                                            </p>
                                            {listing.seller.verified && (
                                                <span className="text-xs text-green-600">
                                                    ✓ Verified
                                                </span>
                                            )}
                                        </td>

                                        {/* Submitted */}
                                        <td className="px-4 py-3 text-gray-500 text-xs">
                                            {new Date(listing.createdAt)
                                                .toLocaleDateString('en-ZA', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-3">
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
                                        </td>
                                    </tr>

                                    {/* Inline rejection reason row */}
                                    {rejectionTarget === listing.id && (
                                        <tr key={`${listing.id}-reject`} className="bg-red-50">
                                            <td colSpan={7} className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="text"
                                                        value={rejectionReason}
                                                        onChange={e => setRejectionReason(e.target.value)}
                                                        placeholder="Enter rejection reason..."
                                                        className="flex-1 text-sm"
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={() => handleReject(listing.id)}
                                                        disabled={!rejectionReason.trim() || actionLoading === listing.id}
                                                        className="px-3 py-1.5 bg-[#dc2626] text-white text-xs font-semibold rounded 
                                                        hover:bg-[#b91c1c] disabled:opacity-50 transition-colors whitespace-nowrap"
                                                    >
                                                        Confirm Reject
                                                    </button>
                                                    <button
                                                        onClick={() => { setRejectionTarget(null); setRejectionReason('') }}
                                                        className="text-xs text-[#4B4F58] hover:text-[#3a3a3a] transition-colors"
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
    )
}