'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ListingCard, { Listing } from '@/components/listings/listingCard'
import Modal from '@/components/ui/Modal'

// Filter tabs

type Tab = 'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED'

const TABS: { label: string; value: Tab }[] = [
    { label: 'All',      value: 'ALL' },
    { label: 'Active',   value: 'APPROVED' },
    { label: 'Pending',  value: 'PENDING' },
    { label: 'Rejected', value: 'REJECTED' },
]

// Page 

export default function MyListingsPage() {

    const router = useRouter()
    const [listings, setListings] = useState<Listing[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<Tab>('ALL')
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)

    // Fetch

    useEffect(() => {
        const fetchMine = async () => {
            setLoading(true)
            try {
                const res = await fetch('/api/listings/mine')
                const data = await res.json()
                setListings(data.listings ?? [])
            } catch (err) {
                console.error('Failed to load listings', err)
            } finally {
                setLoading(false)
            }
        }
        fetchMine()
    }, [])

    // Derived 

    const filtered = activeTab === 'ALL'
        ? listings
        : listings.filter(l => l.status === activeTab)

    const counts: Record<Tab, number> = {
        ALL:      listings.length,
        APPROVED: listings.filter(l => l.status === 'APPROVED').length,
        PENDING:  listings.filter(l => l.status === 'PENDING').length,
        REJECTED: listings.filter(l => l.status === 'REJECTED').length,
    }

    // Delete 

    const handleDelete = async () => {
        if (!deleteTarget) return
        setDeleting(true)
        try {
            await fetch(`/api/listings/${deleteTarget}`, { method: 'DELETE' })
            setListings(prev => prev.filter(l => l.id !== deleteTarget))
            setDeleteTarget(null)
        } catch (err) {
            console.error('Delete failed', err)
        } finally {
            setDeleting(false)
        }
    }

    // Render 

    return (
        <div className="container-content py-8">

            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div>
                    <h1>My Listings</h1>
                    <p className="text-gray-500 text-sm">
                        Manage your textbook listings
                    </p>
                </div>
                <Link href="/listings/create">
                    <button className="btn-primary">
                        + New Listing
                    </button>
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 mb-6 overflow-x-auto">
                {TABS.map(tab => (
                    <button
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value)}
                        className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                            activeTab === tab.value
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {tab.label}
                        {counts[tab.value] > 0 && (
                            <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                                activeTab === tab.value
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-500'
                            }`}>
                                {counts[tab.value]}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="card animate-pulse flex flex-col gap-3">
                            <div className="h-40 bg-gray-200 rounded" />
                            <div className="h-4 bg-gray-200 rounded w-3/4" />
                            <div className="h-3 bg-gray-100 rounded w-1/2" />
                        </div>
                    ))}
                </div>

            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <svg
                        className="w-12 h-12 mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2
                               2v7m16 0v5a2 2 0 01-2 2H6a2 2 0
                               01-2-2v-5m16 0h-2.586a1 1 0
                               00-.707.293l-2.414 2.414a1 1 0
                               01-.707.293h-3.172a1 1 0
                               01-.707-.293l-2.414-2.414A1 1 0
                               006.586 13H4"
                        />
                    </svg>
                    <p className="text-sm">
                        {activeTab === 'ALL'
                            ? "You haven't listed any textbooks yet."
                            : `No ${activeTab.toLowerCase()} listings.`}
                    </p>
                    {activeTab === 'ALL' && (
                        <Link href="/listings/create">
                            <button className="btn-primary mt-4">
                                Create your first listing
                            </button>
                        </Link>
                    )}
                </div>

            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(listing => (
                        <div key={listing.id} className="relative group">

                            <ListingCard listing={listing} showStatus />

                            {/* Action overlay */}
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">

                                {/* Edit - only for PENDING or APPROVED */}
                                {listing.status !== 'REJECTED' && (
                                    <button
                                        onClick={e => {
                                            e.stopPropagation()
                                            router.push(`/listings/${listing.id}/edit`)
                                        }}
                                        className="bg-white shadow rounded px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Edit
                                    </button>
                                )}

                                {/* Delete */}
                                <button
                                    onClick={e => {
                                        e.stopPropagation()
                                        setDeleteTarget(listing.id)
                                    }}
                                    className="bg-white shadow rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                                >
                                    Delete
                                </button>

                            </div>

                        </div>
                    ))}
                </div>
            )}

            {/* Delete confirmation modal*/}
            <Modal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                title="Delete Listing"
            >
                <p className="text-sm text-gray-600 mb-6">
                    Are you sure you want to delete this listing? This action
                    cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={() => setDeleteTarget(null)}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium disabled:opacity-50"
                    >
                        {deleting ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </Modal>

        </div>
    )
}