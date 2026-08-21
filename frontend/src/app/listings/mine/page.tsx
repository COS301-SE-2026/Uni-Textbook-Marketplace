'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ListingCard, { Listing } from '@/components/listings/listingCard'
import Image from 'next/image'
import { Package } from 'lucide-react'

import { api } from '@/lib/api'
import { updateListingStatus, ListingSaleStatus } from '@/lib/listings.api'
import EditPage from '@/components/listings/editpage'
import { Button } from '@/components/ui'

// Filter tabs

type Tab = 'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED'

const TABS: { label: string; value: Tab }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Active', value: 'APPROVED' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Rejected', value: 'REJECTED' },
]

// Page 

export default function MyListingsPage() {

    
    const [listings, setListings] = useState<Listing[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<Tab>('ALL')
    const [selectedListingId, setSelectedListingId] = useState<string | null>(null)
    const [EditPanel, setEditPanel] = useState(false)

    const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null)
    const [statusError, setStatusError] = useState<string | null>(null)

    // Fetch

    useEffect(() => {
        const fetchMine = async () => {
            setLoading(true)
            try {
                const data = await api.get<Listing[]>('/listings/mine')
                setListings(data)
            } catch (err) {
                console.error('Failed to load listings', err)
            } finally {
                setLoading(false)
            }
        }
        fetchMine()
    }, [])

    // Derived 

    const listingSafe = Array.isArray(listings) ? listings : []

    const filtered = activeTab === 'ALL'
        ? listingSafe
        : listingSafe.filter(l => l.status === activeTab)

    const counts: Record<Tab, number> = {
        ALL: listingSafe.length,
        APPROVED: listingSafe.filter(l => l.status === 'APPROVED').length,
        PENDING: listingSafe.filter(l => l.status === 'PENDING').length,
        REJECTED: listingSafe.filter(l => l.status === 'REJECTED').length,
    }

    const closeEditPanel = () => {
        setEditPanel(false)
        setSelectedListingId(null)
    }
 
    const handleStatusChange = async (
        listingId: string,
        newStatus: ListingSaleStatus,
    ) => {
        setStatusUpdatingId(listingId)
        setStatusError(null)
        try {
            await updateListingStatus(listingId, newStatus)
            setListings(prev =>
                prev.map(l => 
                    l.id === listingId ? { ...l, listing_status:  newStatus } : l,

                ),
            )
        } catch (err) {
            console.error('Failed to update listing status', err)
            setStatusError('Could not update listing status. Please try again.')

        } finally {
            setStatusUpdatingId(null)
        }
    }

    let content

    if (loading) {
        content = (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="card animate-pulse flex flex-col gap-3">
                        <div className="h-40 bg-gray-200 rounded" />
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                ))}
            </div>
        )
    } else if (filtered.length === 0) {
        content = (
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
                        <button type="button" className="btn-primary mt-4">
                            Create your first listing
                        </button>
                    </Link>
                )}
            </div>
        )
    } else {
        content = (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(listing => {
                    const isUpdatingStatus = statusUpdatingId === listing.id

                    return (
                        <div key={listing.id} className="relative group">
                            <ListingCard listing={listing} showStatus={false} />

                            <div className="absolute top-2 left-2 flex flex-wrap gap-1 ">
                                {(listing.status === 'REJECTED' || listing.status === 'PENDING') && (
                                    <Button
                                        variant='primary'
                                        onClick={() => {
                                            setSelectedListingId(listing.id)
                                            setEditPanel(true)
                                        }}
                                    >
                                        Edit
                                    </Button>
                                )}

                                {listing.status === 'APPROVED' && listing.listing_status !== 'SOLD' && (
                                    <>
                                        {listing.listing_status === 'AVAILABLE' && (
                                            <Button
                                                variant='primary'
                                                disabled={isUpdatingStatus}
                                                onClick={() => handleStatusChange(listing.id, 'RESERVED')}
                                            >
                                                {isUpdatingStatus ? 'Updating...' : 'Mark Reserved'}
                                            </Button>
                                        )}
                                        {listing.listing_status === 'RESERVED' && (
                                            <Button
                                                variant='primary'
                                                disabled={isUpdatingStatus}
                                                onClick={() => handleStatusChange(listing.id, 'AVAILABLE')}
                                            >
                                                {isUpdatingStatus ? 'Updating...' : 'Un-reserve'}
                                            </Button>
                                        )}
                                        <Button
                                            variant='primary'
                                            disabled={isUpdatingStatus}
                                            onClick={() => handleStatusChange(listing.id, 'SOLD')}
                                        >
                                            {isUpdatingStatus ? 'Updating...' : 'Mark Sold'}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <>
            {/* Hero Section */}
            <div className="relative overflow-hidden h-[180px] md:h-[200px] w-full" style={{
                background: 'linear-gradient(135deg, #000f2b 0%, #001a3d 30%, #00264a 55%, #004F66 75%, #006D8A 100%)',
                
            }}>
                {/* Image Overlay */}
                <div className="absolute inset-0 right-0 w-full md:w-3/5 lg:w-1/2 ml-auto">
                    <div className="relative w-full h-full">
                        <Image
                            src="/../../my_listings.png"
                            alt="Student reading textbook"
                            fill
                            className="object-contain object-right"
                            priority
                            style={{ objectPosition: '100% 50%' }}
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0" style={{
                            background: 'linear-gradient(90deg, rgba(0,15,43,0.9) 0%, rgba(0,26,61,0.6) 30%, rgba(0,38,74,0.3) 50%, transparent 70%)',
                        }} />
                    </div>
                </div>
                
                {/* Glossy Overlay */}
                <div className="absolute inset-0 opacity-20" style={{
                    background: 'radial-gradient(ellipse at 20% 0%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(0,180,216,0.05) 0%, transparent 50%)',
                }} />
                
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(0, 180, 216, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(0, 180, 216, 0.15) 0%, transparent 50%)',
                }} />
                
                {/* Decorative Grid */}
                <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }} />
                
                {/* Glossy Highlight Line */}
                <div className="absolute top-0 left-0 right-0 h-px" style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                }} />
                
                <div className="relative z-10 px-6 py-4 md:px-8 lg:px-12 h-full flex flex-col justify-center max-w-7xl mx-auto w-full">
                    <div className="flex items-start gap-4">
                        <div className="p-2 rounded-xl" style={{
                            background: 'rgba(255,255,255,0.08)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                        }}>
                            <Package size={24} className="text-[#00B4D8]" />
                        </div>
                        <div>
                            <h1 className="text-white text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight drop-shadow-lg">
                                My Listings
                            </h1>
                            <p className="text-white/80 text-xs md:text-sm mt-0.5 drop-shadow-md">
                                Manage your textbook listings
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Bottom Glossy Edge */}
                <div className="absolute bottom-0 left-0 right-0 h-px" style={{
                    background: 'linear-gradient(90deg, transparent, rgba(0,180,216,0.3), transparent)',
                }} />
            </div>

            {/* Content */}
            <div className="container-content py-8 relative">
                {/* Header with New Listing Button */}
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                    <div>
                        
                    </div>
                    <Link href="/listings/create">
                        <button type="button" className="btn-primary">
                            + New Listing
                        </button>
                    </Link>
                </div>

                {statusError && (
                    <p className="text-sm text-red-600 mb-4">{statusError}</p>
                )}

                {/* Tabs */}
                <div className="flex gap-2 border-b border-gray-200 mb-6 overflow-x-auto">
                    {TABS.map(tab => (
                        <button
                            type="button"
                            key={tab.value}
                            onClick={() => setActiveTab(tab.value)}
                            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                                activeTab === tab.value
                                    ? 'border-[#00B4D8] text-[#00B4D8]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab.label}
                            {counts[tab.value] > 0 && (
                                <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                                    activeTab === tab.value
                                        ? 'bg-[#00B4D8] text-white'
                                        : 'bg-gray-100 text-gray-500'
                                }`}>
                                    {counts[tab.value]}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {content}

                {selectedListingId && (
                    <EditPage
                        onClick={closeEditPanel}
                        PanelStatus={EditPanel}
                        listingId={selectedListingId}
                    />
                )}
            </div>
        </>
    )
}