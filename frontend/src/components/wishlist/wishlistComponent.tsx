'use client'

import ListingCard, { Listing } from "@/components/listings/listingCard";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";

//filters LISTTABS
type Tab = 'ALL' | 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'WITHDRAWN'

const LISTTABS: { label: string; value: Tab }[] = [
    { label: 'ALL', value: 'ALL' },
    { label: 'Available', value: 'AVAILABLE' },
    { label: 'Reserved', value: 'RESERVED' },
    { label: 'Sold', value: 'SOLD' },
    { label: 'Withdrawn', value: 'WITHDRAWN' },
]

export default function WishlistComponent() {

    const [loading, setLoading] = useState(true)
    const [listings, setListings] = useState<Listing[]>([])
    const [listactiveTab, setlistactiveTab] = useState<Tab>('ALL')

    useEffect(() => {

        const fetchMywishlist = async () => {
            setLoading(true)

            try {
                const data = await api.get<Listing[]>('/wishlist/mywishlist')
                //console.log(data);
                console.log(Array.isArray(data));

                setListings(data)

            } catch (err) {
                console.error('Failed to load wishlists', err)
            } finally {
                setLoading(false)
            }
        }
        fetchMywishlist()
    }, [])

    const safelisting = Array.isArray(listings) ? listings : [];
    const filters = listactiveTab == 'ALL' ? safelisting : safelisting.filter(lis => lis.listing_status === listactiveTab)

    const listnum: Record<Tab, number> = {
        ALL: safelisting.length,
        AVAILABLE: safelisting.filter(lis => lis.listing_status === 'AVAILABLE').length,
        RESERVED: safelisting.filter(lis => lis.listing_status === 'RESERVED').length,
        SOLD: safelisting.filter(lis => lis.listing_status === 'SOLD').length,
        WITHDRAWN: safelisting.filter(lis => lis.listing_status === 'WITHDRAWN').length,
    }

    return (
        <div className="container-content py-8">
            <div className="mb-6">
                <h1>My Wishlist</h1>
                <p className="text-gray-500 text-sm">
                    Keep up to date with your favourite listings
                </p>
            </div>

            {/* LISTTABS */}
            <div className="flex gap-2 border-b border-gray-200 mb-6 overflow-x-auto">
                {LISTTABS.map(tab => (
                    <button
                        key={tab.value}
                        onClick={() => setlistactiveTab(tab.value)}
                        className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${listactiveTab === tab.value
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab.label}
                        {listnum[tab.value] > 0 && (
                            <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${listactiveTab === tab.value
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-500'
                                }`}>
                                {listnum[tab.value]}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* content of wilshlits */}
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

            ) : filters.length === 0 ? (
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
                        {listactiveTab === 'ALL'
                            ? "You do not have favourites yet."
                            : `No ${listactiveTab.toLowerCase()} listings.`}
                    </p>
                    {listactiveTab === 'ALL' && (
                        <Link href="/listings">
                            <button className="btn-primary mt-4">
                                Browse our listings to find your favourite listing
                            </button>
                        </Link>
                    )}
                </div>

            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filters.map(listing => (
                        <div key={listing.id} className="relative group">

                            <ListingCard listing={listing} showStatus={false} isLiked={true}/>

                        </div>
                    ))}
                </div>
            )}

        </div>
    )
}